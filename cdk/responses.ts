export const responseParameters = {
  'method.response.header.Access-Control-Allow-Origin': "'*'",
}

export const errorResponses = [
  {
    selectionPattern: '200',
    statusCode: '200',
    responseParameters,
  },
  {
    selectionPattern: '400',
    statusCode: '400',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "bad input"
          }`,
    },
  },
  {
    selectionPattern: '403',
    statusCode: '403',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "forbidden"
          }`,
    },
  },
  {
    selectionPattern: '404',
    statusCode: '404',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "not found"
          }`,
    },
  },
  {
    selectionPattern: '5\\d{2}',
    statusCode: '500',
    responseParameters,
    responseTemplates: {
      'application/json': `{
            "error": "internal service error"
          }`,
    },
  },
]

export const integrationResponses = [
  {
    statusCode: '200',
    responseParameters,
  },
  {
    statusCode: '201',
    responseParameters,
  },
  {
    statusCode: '204',
    responseParameters,
  },
  ...errorResponses,
]

export const methodResponses = [
  {
    statusCode: '200',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '400',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '403',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '404',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
  {
    statusCode: '500',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  },
]
