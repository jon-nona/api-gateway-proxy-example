# Api Gateway Proxy Example <!-- omit in toc -->

> A [CDK stack to demonstrate API gateway Proxy Integration](cdk/api-gateway-proxy-example-stack.ts) (Lambda and HTTP)

It exposes two proxie'd Flickr endpoints (photos/recent and photos/search) which respond to GET requests, one proxied via a Lambda proxy integration at /photos/search which corresponds to
[flickr.photos.search](https://www.flickr.com/services/api/flickr.photos.search.html) which returns the response in JSON format, and [flickr.photos.getRecent](https://www.flickr.com/services/api/flickr.photos.getrecent.html) which does the same thing, just via an API gateway HTTP integration, with no lambda.

A basic custom lambda authorizer sits in front of the API Gateway. Api Keys etc are retrieved by cdk in [The Construct](cdk/api-gateway-proxy-example-stack.ts) and passed to the relevant Lambda's environment at deploy time.

Use Cases:

- Lambda: You want to proxy a third party api endpoint, but perform some computation between request/response.
- HTTP: You want to proxy a third party api endpoint, and control the responses, map the output.

Benefits of using HTTP over lambda are obviously not paying for lambda invocations, or dealing with cold starts.

Benefits of proxying third party API's through your own in this manner include say for React Native [Not storing sensitive API keys in your app code](https://reactnative.dev/docs/security).

<!-- TOC -->

## Table of Contents <!-- omit in toc -->

- [Setup](#setup)
- [Development](#development)
  - [Setting up the environment](#setting-up-the-environment)
- [Testing](#testing)
- [Run Locally](#run-locally)
- [Deploying](#deploying)
- [Additional Docs](#additional-docs)
- [License](#license)

<!-- TOC -->

## Setup

1. go through all the Prerequisites in [Prerequisites](docs/prerequisites.md)
2. `npm i` install NPM dependencies

If you run into issues, see the additional docs below \*\_[bottom of page](#Additional-Docs)

## Development

### Setting up the environment

Several commands will require a working AWS CLI setup, and also that you have valid AWS_PROFILE and AWS_DEFAULT_REGION environment variables set for the AWS account you will be using. Be sure to do this before continuing.

You should create an environment.json file from environment.json.tpl and add a valid Flickr api key.

## Testing

We use Jest for testing. To run unit tests, you can use one of the following commands, to run once, run in watch mode, or to run all tests and generate converage reports.

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Run Locally

```bash
npm run local
```

This will start a local web server on port `3000` and make the API available to you locally. Typescript code will automatically be recompiled when there are changes while the server is running. You will need to kill and restart this if you change `cdk/api-gateway-proxy-example-stack.ts` or `package.json`.

## Deploying

There is one stack defined for production. This repo uses CDK to define these stacks. To deploy you can run:

```bash
npx cdk synth
npx cdk deploy ApiGatewayProxyExampleStack
```

## Additional Docs

- [Contributing](docs/contributing.md)
- [Prerequisites](docs/prerequisites.md)
- [Debugging](docs/debugging.md)
- [Gotchas](docs/gotchas.md)
- [Misc](docs/misc.md)
- [Node Version](docs/node-version.md)

**[⬆ back to top](#table-of-contents)**

## License

[ISC](LICENSE) © 2020 Jonathan Arnold <jon@nonacreative.com>
