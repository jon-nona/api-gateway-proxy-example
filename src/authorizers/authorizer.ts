import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda'
import Config from './config'
import { simpleTokenAuthorizationHandler } from './simpleTokenAuthorizationHandler'

console.log('Loading function')

/**
 * A custom authorizer that validates a specific authorization header
 */
export const handler = (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> =>
  simpleTokenAuthorizationHandler(event, Config.apiToken)
