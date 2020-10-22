import '@aws-cdk/assert/jest'
import * as cdk from '@aws-cdk/core'
import * as ApiGateWayProxyExample from '../cdk/api-gateway-proxy-example-stack'

describe('ApiGatewayProxyExampleStack', () => {
  const app = new cdk.App()
  // when I create my stack
  const stack = new ApiGateWayProxyExample.ApiGatewayProxyExampleStack(
    app,
    'TestApiGateWayProxyExample',
    {},
  )

  describe('Rest Api', () => {
    it('should have a Rest Api as a resource', () => {
      console.log(stack)
      expect(stack).toHaveResourceLike('AWS::ApiGateway::Resource')
    })
  })
})
