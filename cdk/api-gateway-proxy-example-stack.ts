import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'
import * as cdk from '@aws-cdk/core'
import { StackProps } from '@aws-cdk/core'
import * as path from 'path'
import { integrationResponses, methodResponses } from './responses'

export class ApiGatewayProxyExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props)
    const apiGatewayProxyExampleSecrets = secretsmanager.Secret.fromSecretName(
      this,
      'ApiGatewayProxyExampleSecret',
      'apiGateWayProxyExampleStack',
    )

    const apiKey = apiGatewayProxyExampleSecrets.secretValueFromJson('apiKey')
    const flickrApiKey = apiGatewayProxyExampleSecrets.secretValueFromJson(
      'flickrApiKey',
    )

    const authorizerLambda = new lambda.Function(
      this,
      'ApiGatewayProxyExampleAuthorizerLambda',
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist')),
        environment: {
          API_TOKEN: `${apiKey}`,
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

    const flickrPhotosSearchLambda = new lambda.Function(
      this,
      'FlickrPhotoSearchLambda',
      {
        functionName: 'FlickrPhotoSearchLambda',
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist')),
        handler: 'modules/flickr/handlers.searchPhotos',
        environment: {
          API_KEY: `${flickrApiKey}`,
          API_URL: 'https://www.flickr.com/services/rest',
        },
      },
    )

    const flickrRecentPhotosIntegration = new apigateway.Integration({
      integrationHttpMethod: 'GET',
      type: apigateway.IntegrationType.HTTP,
      uri: `https://www.flickr.com/services/rest`,
      options: {
        connectionType: apigateway.ConnectionType.INTERNET,
        integrationResponses,
        requestParameters: {
          'integration.request.querystring.api_key': `'${flickrApiKey}'`,
          'integration.request.querystring.format': `'json'`,
          'integration.request.querystring.nojsoncallback': `'1'`,
          'integration.request.querystring.method': `'flickr.photos.getRecent'`,
          'integration.request.querystring.extras':
            'method.request.querystring.extras',
          'integration.request.querystring.per_page':
            'method.request.querystring.per_page',
          'integration.request.querystring.page':
            'method.request.querystring.page',
        },
      },
    })

    const photos = api.root.addResource('photos')
    const photosSearch = photos.addResource('search')
    photosSearch.addMethod(
      'GET',
      new apigateway.LambdaIntegration(flickrPhotosSearchLambda),
      {
        authorizer,
      },
    )
    const photosRecent = photos.addResource('recent')
    photosRecent.addMethod('GET', flickrRecentPhotosIntegration, {
      authorizer,
      requestParameters: {
        'method.request.querystring.extras': true,
        'method.request.querystring.per_page': true,
        'method.request.querystring.page': true,
      },
      methodResponses,
    })
  }
}
