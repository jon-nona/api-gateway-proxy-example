export const respond = (
  statusCode: number,
  data: Record<string, unknown>,
): any => {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }
}
