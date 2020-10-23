import * as SUT from './utils'

describe('Utils', () => {
  describe('constructSearchUri', () => {
    it('should take an api url, an api key and some queryParameters in key/value format and return a uri', () => {
      // given ... we have an api url
      const apiUrl = 'http://www.google.com'
      // ... we have an api key
      const apiKey = 'some-api-key'
      // ... we have some queryParameters
      const params = {
        param1: 'test',
        param2: 'test',
      }
      // when ... we call our function
      const result = SUT.constructSearchUri(apiUrl, apiKey, params)
      // then ... the result should be returned as expected
      expect(result).toEqual(
        'http://www.google.com?method=flickr.photos.search&api_key=some-api-key&format=json&nojsoncallback=1&param1=test&param2=test',
      )
    })
  })
})
