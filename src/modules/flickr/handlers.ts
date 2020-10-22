import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Flickr from "flickr-sdk";
import { respond } from "../../common/utils";
import config from "./config";
export const searchPhotos = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const flickr = new Flickr(config.apiKey);
    const results = await flickr.photos.search({
      ...event.queryStringParameters,
    });
    return respond(200, results.body);
  } catch (error) {
    console.log(error);
    return respond(500, {
      error: error.message,
    });
  }
};
