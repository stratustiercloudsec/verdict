import json, boto3, requests, logging
from datetime import datetime
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")
table = dynamodb.Table("ProjectSuccessEstimator")

TMDB_API_KEY = "YOUR_TMDB_API_KEY"

def get_talent_intelligence(name):
    try:
        url = f"https://api.themoviedb.org/3/search/person?api_key={TMDB_API_KEY}&query={name}"
        res = requests.get(url).json()
        if not res.get('results'): return f"No data for {name}."
        p_id = res['results'][0]['id']
        c_url = f"https://api.themoviedb.org/3/person/{p_id}/movie_credits?api_key={TMDB_API_KEY}"
        m_data = requests.get(c_url).json()
        films = [m['title'] for m in sorted(m_data.get('cast', []), key=lambda x: x.get('popularity', 0), reverse=True)[:5]]
        return f"{name}'s work: {', '.join(films)}."
    except: return "History unavailable."

def lambda_handler(event, context):
    audit_id = event.get("auditId")
    project_name = event.get("projectName")
    form = event.get("formData", {})

    # 1. SANITIZATION
    prod_budget = int(float(form.get('productionBudget', 0)))
    intel = get_talent_intelligence(form.get('leadActor'))

    prompt = f"Human: Analyze {project_name}. Identify 3 comps. Return ONLY JSON with keys: verdict, score, summary, comps (array with TITLE, BOXOFFICE, NOTES), recommendations. Assistant:"

    try:
        # 2. AI INVOCATION
        resp = bedrock.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=json.dumps({"anthropic_version": "bedrock-2023-05-31", "max_tokens": 2000, "messages": [{"role": "user", "content": prompt}]})
        )
        ai_raw = json.loads(json.loads(resp.get("body").read())['content'][0]['text'])

        # 3. KEY ENFORCEMENT
        # This loop forces lowercase keys into the uppercase keys the UI needs
        sanitized_comps = []
        for item in ai_raw.get('comps', []):
            sanitized_comps.append({
                "TITLE": str(item.get("TITLE") or item.get("title") or item.get("Title") or "UNKNOWN"),
                "BOXOFFICE": str(item.get("BOXOFFICE") or item.get("boxOffice") or "N/A"),
                "NOTES": str(item.get("NOTES") or item.get("notes") or "")
            })

        # 4. DATABASE UPDATE
        table.update_item(
            Key={"auditId": audit_id, "projectName": project_name},
            UpdateExpression="SET verdict=:v, score=:s, summary=:sum, comps=:c, recommendations=:r, lastUpdatedAt=:ts, #st=:status",
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={
                ":v": ai_raw.get('verdict', 'FAIL'),
                ":s": Decimal(str(ai_raw.get('score', 0))),
                ":sum": ai_raw.get('summary', ''),
                ":c": json.dumps(sanitized_comps), # Save as standardized string
                ":r": str(ai_raw.get('recommendations', '')),
                ":ts": datetime.utcnow().isoformat(),
                ":status": "COMPLETED"
            }
        )
        return {"status": "SUCCESS", "auditId": audit_id, "projectName": project_name}
    except Exception as e:
        logger.error(str(e))
        raise e
