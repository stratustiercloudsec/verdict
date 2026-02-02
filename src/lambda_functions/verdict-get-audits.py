import json
import boto3
from decimal import Decimal

# Initialize DynamoDB resource in your primary region
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
TABLE_NAME = "SuccessAudits"

# Helper to handle DynamoDB Decimal types in JSON
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    # CORS headers matching your React application origin
    headers = {
        'Access-Control-Allow-Origin': 'http://44.200.161.202',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
    }

    try:
        table = dynamodb.Table(TABLE_NAME)
        
        # 1. Fetch all records from the table
        response = table.scan()
        items = response.get('Items', [])
        
        # 2. Map Database fields to UI interface (AUDIT) keys
        mapped_audits = []
        for item in items:
            mapped_audits.append({
                "id": item.get('auditId', 'N/A'),
                "reportDate": item.get('timestamp', 'N/A').split('T')[0], # Cleans "YYYY-MM-DDTHH..." to "YYYY-MM-DD"
                "auditName": item.get('fileName', 'Untitled').split('.')[0], # Cleaner project name
                "resource": item.get('s3Key', 'N/A'),
                "reporter": item.get('userName', 'System'),
                "submitterEmail": item.get('userEmail', 'N/A'),
                "submitterRole": item.get('userRole', 'GUEST'),
                "reportType": item.get('category', 'Full Script'),
                "successGauge": item.get('score', 0) # Numeric score for UI color logic (70/40/0)
            })
            
        # 3. Sort by date descending (latest first)
        mapped_audits.sort(key=lambda x: x['reportDate'], reverse=True)
        
        # 4. Return the 'audits' object expected by setAuditData(data.audits)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"audits": mapped_audits}, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to load audits', 'details': str(e)})
        }
