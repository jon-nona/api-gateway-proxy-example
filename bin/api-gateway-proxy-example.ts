#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { ApiGatewayProxyExampleStack } from '../cdk/api-gateway-proxy-example-stack'

const app = new cdk.App()

new ApiGatewayProxyExampleStack(app, 'ApiGatewayProxyExampleStack', {
  env: { region: 'eu-west-1', account: '507602307034' },
})

new ApiGatewayProxyExampleStack(app, 'ApiGatewayProxyExampleLocalStack', {
  env: { region: 'eu-west-1', account: '507602307034' },
})
