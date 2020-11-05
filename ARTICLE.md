# Proxying 3rd Party Endpoints Through AWS API Gateway (Part 1) Custom HTTP & AWS Lambda Integrations

Often when building a mobile or web applications one needs to make use of third party API's. Storing keys for a third party service in your application is a terrible idea from a security perspective, as anyone poking around inside your app can just retrieve them with a bit of work. Added to this, if you are stitching together use of multiple third party API's on the client side, you don't get the benefit of a set of coherent backend endpoints to call, all providing the same interface to the caller.

[The React Native Guide On Security](https://reactnative.dev/docs/security) has the following to say on the subject:

> If you must have an API key or a secret to access some resource from your app, the most secure way to handle this would be to build an orchestration layer between your app and the resource. This could be a serverless function (e.g. using AWS Lambda or Google Cloud Functions) which can forward the request with the required API key or secret. Secrets in server side code cannot be accessed by the API consumers the same way secrets in your app code can.

## API Gateway To The Rescue

[AWS API Gateway](https://aws.amazon.com/api-gateway/) plus potentially [AWS Lambda](https://aws.amazon.com/lambda/) is listed as a perfect fit for this by that guide, allowing us to [securely store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) API keys and to easily provide a unified API to our client, forwarding any requests and potentially transforming any responses to whatever we would like to present to our client. There are a couple of different ways to integrate a third party endpoint or even an entire third party API with your API Gateway instance, and choosing which one to use when can get a little bit confusing. The options in short are:

- HTTP Proxy - The HTTP proxy integration, designated by HTTP_PROXY in the API Gateway REST API, is for integrating a method request with a backend HTTP endpoint. With this integration type, API Gateway simply passes the entire request and response between the frontend and the backend, subject to certain restrictions and limitations.
- HTTP Custom Integration - Also for integrating a method with a backend HTTP endpoint. [This Guide to Proxy vs Custom Integration Type from Amazon](https://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-http-integrations.html) says 'To build an API with HTTP integration, you can use either the HTTP proxy integration or the HTTP custom integration. We recommend that you use the HTTP proxy integration, whenever possible, for the streamlined API set up while providing versatile and powerful features. The HTTP custom integration **can be compelling if it is necessary to transform client request data for the backend or transform the backend response data for the client**.'
- Lambda Integration/Lambda Proxy - Attach a gateway method to a Lambda function. For the differences between the two, check out [this article on the subject](https://medium.com/@lakshmanLD/lambda-proxy-vs-lambda-integration-in-aws-api-gateway-3a9397af0e6d).

Basically between HTTP and HTTP proxy integrations and Lambda and Lambda Proxy Integrations the main difference is that with the non proxy integration type for both that you can transform the request and response and remap request/response headers on the API Gateway level, while for the proxy integration type the request and response are passed through and back as is.

## Which One To Use

Before diving in to giving examples of how to implement these one has to decide which one is the best fit for a use case.

The non proxy integrations allow more control over transforming the request and responses at the Gateway level. The lambda integrations obviously come with a cost to each invocation, but allow additional computation to be performed.

So with that in mind one should ask yourself the following:

1. Do I need to remap my request/response from my 3rd party API:
   1. Yes - Lambda Integration or Custom HTTP integration.
   2. No - Lambda Proxy Integration or HTTP Proxy Integration.
2. Do I need to perform addtional computational tasks before returning a response:
   1. Yes - Lambda Integration (Proxy or just Lambda)
   2. No - HTTP integration (Custom or Proxy)

## Example Time

We're making use of [AWS CDK](https://aws.amazon.com/cdk/) to define our infrastructure as code.

In the following example, we're going to look at defining a stack which proxies one Flickr API endpoint using a Lambda integration, and then achieves the same thing for another Flickr api endpoint using a custom HTTP integration.

The full source code for the CDK stack and lambda functions is available at [https://github.com/jon-nona/api-gateway-proxy-example](https://github.com/jon-nona/api-gateway-proxy-example), with a circle-ci config file for running tests and deploying the stack [available here](https://github.com/jon-nona/api-gateway-proxy-example/blob/master/.circleci/config.yml).

### Stack Definition

The [following file](https://github.com/jon-nona/api-gateway-proxy-example/blob/master/cdk/api-gateway-proxy-example-stack.ts) defines our API Gateway Stack using CDK.

```Typescript
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as ssm from '@aws-cdk/aws-ssm'
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
```

#### Paramstore

First in the above file, we reference a couple of parameters that we have already created in [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/), namely a temporary API key that we are using with a barebones custom Lambda authorizer, and then our Flickr Api key. These, for convenience sake we store in one JSON object, and then retrieve them.

We can then reference these in our stack definition, and CDK will resolve the values at deploy time for us, and, in the Lambda's case, pass them in as environment variables.

```Typescript
const apiGatewayProxyExampleSecrets = secretsmanager.Secret.fromSecretName(
      this,
      'ApiGatewayProxyExampleSecret',
      'apiGateWayProxyExampleStack',
    )

const apiKey = apiGatewayProxyExampleSecrets.secretValueFromJson('apiKey')
const flickrApiKey = apiGatewayProxyExampleSecrets.secretValueFromJson(
'flickrApiKey',
    )
```

### API Gateway Instance

We define an API gateway with the following:

```Typescript
const api = new apigateway.RestApi(this, `ApiGatewayProxyExampleApi`, {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
      deployOptions: {
        stageName: 'v1',
      },
    })
```

#### Lambda Integration

We're going to proxy the Flickr photos search endpoint with a Lambda integration.

First, we define a Lambda function (flickrPhotosSearchLambda) in our CDK construct, and pass it as environment variables the Flickr REST API endpoint and our Flickr API Key.

```Typescript
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
```

Then, to add the /photos/search endpoint to our Api we write the following:

```Typescript
const photos = api.root.addResource('photos')
const photosSearch = photos.addResource('search')
photosSearch.addMethod(
'GET',
new apigateway.LambdaIntegration(flickrPhotosSearchLambda),
{
  authorizer,
},
)
```

This will add a new GET request endpoint at /photos/search for our API, and call our lambda with whatever parameters we pass through. It will use the custom authorizer defined in the top of the stack. We could also remap or specify whatever parameters we wish our gateway to accept, but for this simple example we'll leave this step out.

The [actual Lambda function](https://github.com/jon-nona/api-gateway-proxy-example/blob/master/src/modules/flickr/handlers.ts) has the following code:

```Typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { respond } from '../../common/utils'
import config from './config'
import { constructSearchUri } from './utils'

export const searchPhotos = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const uri = constructSearchUri(
      config.apiUrl,
      config.apiKey,
      event.queryStringParameters,
    )

    const result = await fetch(uri, {
      method: 'GET',
    })

    const json = await result.json()
    return respond(result.status, json)
  } catch (error) {
    console.log('error:', error?.message)
    return respond(500, {
      error: error.message,
    })
  }
}
```

Constructing the uri to call the Flickr endpoint is also pretty straightforward:

```Typescript
import R from 'ramda'
export const constructSearchUri = R.curry(
  (
    apiUrl: string,
    apiKey: string,
    queryStringParameters: Record<string, string>,
  ) =>
    R.pipe(
      R.ifElse(R.isNil, R.always({}), R.identity),
      R.toPairs,
      R.map(R.join('=')),
      R.join('&'),
      R.concat(
        `${apiUrl}?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&`,
      ),
    )(queryStringParameters),
)
```

If we now call our /photos/search endpoint, we can (assuming we pass the correct api key in the Authorization header) search Flickr for photos and retrieve the results. As I said above, if we wanted to transform our response, we could do this with a [mapping template](https://www.alexdebrie.com/posts/api-gateway-elements/#integration-response-mapping-templates) but this is beyond the scope of this article. For a more in depth overview, I highly suggest clicking through to the above link.

#### Custom HTTP Integration

So we've managed to create an endpoint for our API Gateway that allows searching of photo's on Flickr. How could we achieve the same functionality without using a Lambda?

Pretty easily as it turns out. First we define a standard set of integration responses. These (listed below) define and set the following:

- responseParameters: Sets access control allow origin from anywhere for our method response
- integrationResponses: Defines responses from our integration, and maps response codes from the endpoint we are calling through to, to responses from our Api Gateway.

```Typescript
export const responseParameters = {
  'method.response.header.Access-Control-Allow-Origin': "'*'",
}

export const errorResponses = [
  {
    selectionPattern: '200',
    statusCode: '200',
    responseParameters,
  },
  {
    selectionPattern: '400',
    statusCode: '400',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "bad input"
          }`,
    },
  },
  {
    selectionPattern: '403',
    statusCode: '403',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "forbidden"
          }`,
    },
  },
  {
    selectionPattern: '404',
    statusCode: '404',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "not found"
          }`,
    },
  },
  {
    selectionPattern: '5\\d{2}',
    statusCode: '500',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "internal service error"
          }`,
    },
  },
]

export const integrationResponses = [
  {
    statusCode: '200',
    responseParameters,
  },
  {
    statusCode: '201',
    responseParameters,
  },
  {
    statusCode: '204',
    responseParameters,
  },
  ...errorResponses,
]

export const methodResponses = [
  {
    statusCode: '200',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '400',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '403',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '404',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '500',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
]
```

Then, we define an HTTP integration. In this integration we're going integrate the recent photos from Flickr endpoint (see: `` integration.request.querystring.method': `'flickr.photos.getRecent'`, ``)

```Typescript
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
```

The integrationMethod we specify as GET. The type we specify as `apigateway.IntegrationType.HTTP` for an HTTP integration and the uri we set to the Flickr REST services endpoint. Under options we use `apigateway.ConnectionType.INTERNET` since it's an external endpoint (other options include VPC_LINK for accessing resources in a VPC), and for integrationResponses we pass the responses that we defined above.

Penultimately, we need to pass some query string parameters as static values to our integration (api key, format, nojsoncallback). We do this in the requestParameters property. Note that static parameter values are wrapped by single quotes, so actually a string with single quotes around it (hence the use of backticks). Finally, we specify mappings between method querystring parameters and integration querystring parameters.

All that remains for us to do then, is to define the method on our API gateway instance. We can do this as follows

```Typescript
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
```

This just adds the method at /photos/recent as a GET request, adds our custom authorizer to it, and then allows the query parameters extras, per_page and page (which the getRecent Flickr API endpoint has as parameters).

That concludes Part 1. In the Part 2, we'll look at Lambda Proxy and HTTP Proxy integration types, and (in the case of HTTP Proxy) how easy it is to proxy an entire 3rd party API via API gateway.
