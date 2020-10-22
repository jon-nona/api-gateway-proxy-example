import * as awsSdk from 'aws-sdk'

const ssm = new awsSdk.SSM()

export async function getParam(
  name: string,
  withEncryption = false,
  ssmInstance = ssm,
): Promise<string> {
  const result = await ssmInstance
    .getParameter({
      Name: name,
      WithDecryption: withEncryption,
    })
    .promise()

  return result.Parameter?.Value ?? ''
}
