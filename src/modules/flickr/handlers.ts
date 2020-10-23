import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import fetch from 'node-fetch'
import { respond } from '../../common/utils'
import config from './config'
import { constructSearchUri } from './utils'

export const searchPhotos = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const uri = constructSearchUri(
      config.apiUrl,
      config.apiKey,
      event.queryStringParameters,
    )

    const result = await fetch(uri, {
      method: 'GET',
    })

    const json = await result.json()
    return respond(result.status, json)
  } catch (error) {
    console.log('error:', error?.message)
    return respond(500, {
      error: error.message,
    })
  }
}
