const mockSearch = jest.fn()
jest.mock('flickr-sdk', () =>
  jest.fn().mockImplementation(() => ({
    photos: {
      search: mockSearch,
    },
  })),
)
import { mocked } from 'ts-jest/utils'
import * as SUT from './handlers'
import * as paramstore from '../../services/aws/paramstore'
import fetch from 'node-fetch'
const { Response } = jest.requireActual('node-fetch')

describe('handlers', () => {
  describe('proxyRequest', () => {
    it('should return a successful response proxied from flickr if everything completes successfully', async () => {
      // given ... we have a lambda event
      const event: any = {
        queryStringParameters: {
          text: 'doggo',
          test2: 'test2',
        },
      }
      // ... we have mocked the getParam method to return static values successfully

      mockSearch.mockResolvedValueOnce({
        body: {
          something: 'value',
        },
      })

      // ... we have mocked the result of the call to the flickr api
      // when ...we call our method
      const result = await SUT.searchPhotos(event)

      // then ... the response should be returned as expected
      expect(result).toEqual({
        body: '{"something":"value"}',
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

      mockSearch.mockRejectedValueOnce('Boom!')

      // ... we have mocked the result of the call to the flickr api to reject
      // when ...we call our method
      const result = await SUT.searchPhotos(event)

      // then ... the response should be returned as expected
      expect(result).toEqual({
        body: '{}',
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
