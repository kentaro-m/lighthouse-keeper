import yaml from 'js-yaml'
import fs from 'fs'
import { Handler } from 'aws-lambda'
import { SQS } from 'aws-sdk'

type Site = {
  title: string
  url: string
}

type Config = {
  sites: Site[]
}

export const handler: Handler = async (_, __, callback) => {
  try {
    const sqsQueueUrl = process.env.SQS_QUEUE_URL

    if (!sqsQueueUrl) {
      throw new Error('sqs queue URL is not set.')
    }

    const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8')) as Config

    const sqs = new SQS({apiVersion: '2012-11-05'})

    const requests = config.sites.map(site => sqs.sendMessage({
      DelaySeconds: 10,
      MessageAttributes: {
        'title': {
          DataType: 'String',
          StringValue: site.title
        },
        'url': {
          DataType: 'String',
          StringValue: site.url
        },
      },
      MessageBody: `Run a Lighthouse audits to ${site.url}`,
      QueueUrl: sqsQueueUrl
    }).promise())

    await Promise.all(requests)
  } catch (error) {
    console.log(error)
    return callback(error)
  }

  return callback(null)
}