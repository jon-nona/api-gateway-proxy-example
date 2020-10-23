import * as apigateway from '@aws-cdk/aws-apigateway'
import { PassthroughBehavior } from '@aws-cdk/aws-apigateway'
import { ICertificate } from '@aws-cdk/aws-certificatemanager'
import * as lambda from '@aws-cdk/aws-lambda'
import * as ssm from '@aws-cdk/aws-ssm'
import * as cdk from '@aws-cdk/core'
import { StackProps } from '@aws-cdk/core'
import * as path from 'path'

export class ApiGatewayProxyExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const apiKeyToken = ssm.StringParameter.valueForSecureStringParameter(
      this,
      '/api-gateway-proxy-example/api-key',
      1,
    )

    const flickrApiKey = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'FlickrApiKey',
      {
        parameterName: '/api-gateway-proxy-example/flickr-api-key',
        version: 1,
      },
    )

    const flickrApiSecret = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'FlickrApiSecretg',
      {
        parameterName: '/api-gateway-proxy-example/flickr-api-secret',
        version: 1,
      },
    )

    const flickrApiKeyToken = ssm.StringParameter.valueForSecureStringParameter(
      this,
      '/api-gateway-proxy-example/flickr-api-key',
      1,
    )

    const authorizerLambda = new lambda.Function(
      this,
      'ApiGatewayProxyExampleAuthorizerLambda',
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist')),
        environment: {
          API_TOKEN: apiKeyToken,
        },
        handler: 'authorizers/authorizer.handler',
      },
    )

    const authorizer = new apigateway.TokenAuthorizer(
      this,
      'apiGatewayProxyExampleAuthorizer',
      {
        handler: authorizerLambda,
      },
    )

    const api = new apigateway.RestApi(this, `ApiGatewayProxyExampleApi`, {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
      deployOptions: {
        stageName: 'v1',
      },
    })

    const mainIntegrationOptions = {
      type: apigateway.IntegrationType.HTTP_PROXY,
      integrationHttpMethod: 'ANY',
    }

    const integrationOptions = {
      connectionType: apigateway.ConnectionType.INTERNET,
      requestParameters: {
        'integration.request.path.proxy': 'method.request.path.proxy',
      },
      passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
      cacheKeyParameters: ['method.request.path.proxy'],
    }

    const defaultMethodOptions: apigateway.MethodOptions = {
      requestParameters: { 'method.request.path.proxy': true },
      authorizer,
    }

    const flickrPhotosSearchLambda = new lambda.Function(
      this,
      'FlickrPhotoSearchLambda',
      {
        functionName: 'FlickrPhotoSearchLambda',
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist')),
        handler: 'modules/flickr/handlers.searchPhotos',
        environment: {
          API_KEY: flickrApiKeyToken,
          API_URL: 'https://www.flickr.com/services/rest',
        },
      },
    )

    const photos = api.root.addResource('photos')
    const photosSearch = photos.addResource('search')
    photosSearch.addMethod(
      'GET',
      new apigateway.LambdaIntegration(flickrPhotosSearchLambda),
      {
        authorizer,
      },
    )
  }
}
