import { Handler } from 'aws-lambda'

export const handler: Handler = async (event, __, callback) => {
  console.log(JSON.stringify(event))
  return callback(null)
}