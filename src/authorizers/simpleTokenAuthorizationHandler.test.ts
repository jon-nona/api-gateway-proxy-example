import * as SUT from './simpleTokenAuthorizationHandler'

describe('simpleTokenAuthorizationHandler', () => {
  it('should return a APIGatewayAuthorizerResult with a result of Allow if the valid token matches the token in the event', async () => {
    // given ... we have an event with a token contained in it.
    const token = 'test'
    const event: any = {
      authorizationToken: 'test',
      methodArn: 'test-arn',
    }
    // ... we have a valid authorizationToken value
    // when ... we call our function
    const result = await SUT.simpleTokenAuthorizationHandler(event, token)
    // then ... the result should be returned as expected

    expect(result).toEqual({
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    })
  })

  it('should return a APIGatewayAuthorizerResult with a result of Deny if the valid token matches the token in the event', async () => {
    // given ... we have an event with a token contained in it.
    const token = 'test-fail'
    const event: any = {
      authorizationToken: 'test',
      methodArn: 'test-arn',
    }
    // ... we have an invalid authorizationToken value
    // when ... we call our function
    const result = await SUT.simpleTokenAuthorizationHandler(event, token)
    // then ... the result should be returned as expected

    expect(result).toEqual({
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    })
  })
})
