import * as SUT from './utils'

describe('utils', () => {
  describe('respond', () => {
    it('return a response object with the relevant data', () => {
      // given ... we have some data to be returned in the body of the reponse
      const data = { test: 'test' }
      // ... we have a status code
      const statusCode = 200
      // when ... we call our method
      const result = SUT.respond(statusCode, data)
      // then ... the data should be returned as expected
      expect(result).toEqual({
        body: '{"test":"test"}',
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 200,
      })
    })
  })
})
