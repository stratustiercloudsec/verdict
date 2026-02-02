import boto3, json
from boto3.dynamodb.conditions import Attr

REGION = 'us-east-1'
dynamodb = boto3.resource('dynamodb', region_name=REGION)
lambda_client = boto3.client('lambda', region_name=REGION)
table = dynamodb.Table('SuccessAudits')

def run_reanalysis():
    print(f"GTM: Initiating Force Upgrade...")
    try:
        # SCAN FIX: Grabs everything currently stuck in QUEUED or 0%
        response = table.scan(FilterExpression=Attr('status').ne('COMPLETED') | Attr('score').eq(0))
        items = response.get('Items', [])
        
        print(f"GTM: Found {len(items)} records to process.")

        for item in items:
            payload = {
                'auditId': item['auditId'],
                'S3Bucket': 'verdict-int-platform',
                'S3Key': item.get('s3Key')
            }
            print(f" -> Analyzing: {item.get('projectName')}")
            lambda_client.invoke(
                FunctionName='verdict-analysis-worker',
                InvocationType='Event', 
                Payload=json.dumps(payload)
            )
        print("\nSUCCESS: All re-analysis triggers sent.")
    except Exception as e:
        print(f"GTM Error: {str(e)}")

if __name__ == "__main__":
    run_reanalysis()
