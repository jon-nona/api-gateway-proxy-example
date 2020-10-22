import * as SUT from './paramstore'

describe('ParamStore', () => {
  describe('getParam', () => {
    it('should return the paramstore value as a string if the value is defined', async () => {
      // given ... we have mocked paramstore to return a parameter object with a value
      const mockSsmInstance: any = {
        getParameter: jest.fn(),
      }

      mockSsmInstance.getParameter = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Parameter: {
            Value: 'test',
          },
        }),
      })
      // when ... we call out method
      const result = await SUT.getParam('test-param', true, mockSsmInstance)
      // then ... it should reutrn the value as expected
      // ... it should call the getParameter instance getParameter method as expected
      expect(mockSsmInstance.getParameter).toHaveBeenCalledWith({
        Name: 'test-param',
        WithDecryption: true,
      })
      expect(result).toEqual('test')
    })
  })
})
