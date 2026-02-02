import json
import boto3
import uuid
from datetime import datetime

# Initialize DynamoDB explicitly in us-east-1
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
TABLE_NAME = "SuccessAudits"

def lambda_handler(event, context):
    # Standard CORS headers for your React origin
    headers = {
        'Access-Control-Allow-Origin': 'http://44.200.161.202',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        # 1. Parse the request from CoverageReport.tsx
        body = json.loads(event.get('body', '{}'))
        s3_key = body.get('s3Key')
        report_type = body.get('reportType', 'Full Script')
        user_email = body.get('userEmail', 'N/A')
        user_name = body.get('userName', 'N/A')

        if not s3_key:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No s3Key provided'})}

        # 2. Create Job ID and Timestamp
        job_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        # 3. Write 'QUEUED' Status to DynamoDB
        # Direct put_item call avoids the AccessDenied DescribeTable error
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item={
            'auditId': job_id,           # Your Partition Key
            's3Key': s3_key,
            'fileName': s3_key.split('/')[-1],
            'category': report_type,
            'userName': user_name,
            'userEmail': user_email,
            'status': 'QUEUED',          # Requested initial status
            'timestamp': timestamp
        })

        # 4. Build success response for the UI
        # Returning 'html' ensures the CoverageReport.tsx state updates correctly
        success_message = f"""
        <div class="p-6 bg-white dark:bg-boxdark border-l-4 border-meta-3 rounded shadow-md">
            <h3 class="text-xl font-bold text-black dark:text-white mb-2">Submission Received</h3>
            <p class="text-black dark:text-white">File: <span class="font-semibold">{s3_key.split('/')[-1]}</span></p>
            <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div class="p-2 bg-gray-100 dark:bg-meta-4 rounded"><strong>Status:</strong> QUEUED</div>
                <div class="p-2 bg-gray-100 dark:bg-meta-4 rounded"><strong>Job ID:</strong> {job_id[:8]}...</div>
            </div>
            <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
                The analysis engine has started processing your document. You will find the completed report in your dashboard shortly.
            </p>
        </div>
        """

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Job successfully queued',
                'jobId': job_id,
                'html': success_message
            })
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f"Queue Engine Error: {str(e)}"})
        }
