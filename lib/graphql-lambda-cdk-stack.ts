import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as iam from '@aws-cdk/aws-iam';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class GraphqlLambdaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'DataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

    const fn = new lambdaNode.NodejsFunction(this, 'graphql', {
      entry: 'src/graphql.js',
      handler: 'graphqlHandler',
      environment: {
        TABLE: table.tableName,
      }
    });

    table.grantReadWriteData(fn);

    const gateway = new apigateway.LambdaRestApi(this, 'gateway', {
      handler: fn,
    });
  }
}
