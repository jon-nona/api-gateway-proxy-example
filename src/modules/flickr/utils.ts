import R from 'ramda'

export const constructSearchUri = R.curry(
  (
    apiUrl: string,
    apiKey: string,
    queryStringParameters: Record<string, string>,
  ) =>
    R.pipe(
      R.ifElse(R.isNil, R.always({}), R.identity),
      R.toPairs,
      R.map(R.join('=')),
      R.join('&'),
      R.concat(
        `${apiUrl}?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&`,
      ),
    )(queryStringParameters),
)
