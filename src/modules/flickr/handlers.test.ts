jest.mock('node-fetch', () => jest.fn())
import fetch from 'node-fetch'
import { mocked } from 'ts-jest/utils'
import * as SUT from './handlers'
const { Response } = jest.requireActual('node-fetch')

describe('handlers', () => {
  describe('searchPhotos', () => {
    it('should return a successful response proxied from flickr if everything completes successfully', async () => {
      // given ... we have a lambda event
      const event: any = {
        queryStringParameters: {
          text: 'doggo',
          test2: 'test2',
        },
      }
      // ... we have mocked the fetch method to return static values successfully

      const mockedFetch = mocked(fetch, true)
      mockedFetch.mockReturnValue(
        Promise.resolve(
          new Response(
            JSON.stringify({
              test: 'test',
            }),
          ),
        ),
      )

      // ... we have mocked the result of the call to the flickr api
      // when ...we call our method
      const result = await SUT.searchPhotos(event)

      // then ... the response should be returned as expected
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

    it('should return a 500 error if anything throws', async () => {
      // given ... we have a lambda event
      const event: any = {
        queryStringParameters: {
          text: 'doggo',
          test2: 'test2',
        },
      }
      // ... we have mocked the getParam method to return static values successfully

      const mockedFetch = mocked(fetch, true)
      mockedFetch.mockRejectedValue(new Error('Blam'))

      const result = await SUT.searchPhotos(event)

      // then ... the response should be returned as expected
      expect(result).toEqual({
        body: '{"error":"Blam"}',
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 500,
      })
    })
  })
})
