import * as AWS from 'aws-sdk'

export async function getParameter(key: string) {
  const ssmClient = new AWS.SSM()

  const result = await ssmClient.getParameter({
    Name: key,
    WithDecryption: true
  }).promise()

  return result.Parameter?.Value
}