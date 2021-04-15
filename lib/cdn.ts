import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

export interface CdnProps {
    gateway: apigateway.IRestApi,
    bucket: s3.IBucket,
    domainName: string,
}

export class Cdn extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: CdnProps) {
        super(scope, id);
        
        const zone = route53.HostedZone.fromLookup(this, props.domainName, {
            domainName: props.domainName
          });

          const certificate = new acm.DnsValidatedCertificate(this, 'cert2', {
              domainName: props.domainName,
              hostedZone: zone,
              region: 'us-east-1',
          })
      
          const distribution = new cloudfront.Distribution(this, 'cdn', {
            defaultBehavior: {
              origin: new origins.HttpOrigin(`${props.gateway.restApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`, {
                originPath: '/prod'
              }),
              allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
              viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              originRequestPolicy: new cloudfront.OriginRequestPolicy(this, 'cdnHeaderPolicy', {
                headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Accept'),
              })
            },
            domainNames: [props.domainName],
            certificate
          });

          distribution.addBehavior('/static/*', new origins.S3Origin(props.bucket, {
            originPath: '/web',
          }), {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          });
      
          // create records for the domain, aliased to the distribution
          new route53.ARecord(this, 'AAlias', {
            zone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
          });
          new route53.AaaaRecord(this, 'AaaaAlias', {
            zone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
          });
    }
}