import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda'

/**
 * A custom authorizer that validates a specific authorization token
 */

const generateAuthorizerResult = (
  principalId: string,
  effect: string,
  resource: string,
): APIGatewayAuthorizerResult => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
})

export const simpleTokenAuthorizationHandler = async (
  event: APIGatewayTokenAuthorizerEvent,
  authorizedToken: string,
): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken
  try {
    return token === authorizedToken
      ? generateAuthorizerResult('user', 'Allow', '*')
      : generateAuthorizerResult('user', 'Deny', '*')
  } catch (error) {
    throw new Error('Unauthorized')
  }
}
