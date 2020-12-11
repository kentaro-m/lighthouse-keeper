import { runLighthouse } from './lib/lighthouse'
import { SQSEvent, Callback, Context } from 'aws-lambda'

require('dotenv').config()

export const handler = async (event: SQSEvent, __: Context, callback: Callback) => {

  console.log(JSON.stringify(event))

  try {
    const targetUrl = event.Records[0].messageAttributes.url.stringValue

    if (!targetUrl) {
      throw new Error('target URL is failed to get.')
    }
    
    const result = await runLighthouse(targetUrl)

    console.log(JSON.stringify(result))

    const lhr = result.lhr
    const data = {
      userAgent: lhr.userAgent,
      environment: lhr.environment,
      lighthouseVersion: lhr.lighthouseVersion,
      fetchTime: lhr.fetchTime,
      requestedUrl: lhr.requestedUrl,
      finalUrl: lhr.finalUrl,
      audits: {
        'first-contentful-paint': lhr.audits['first-contentful-paint'],
        'largest-contentful-paint': lhr.audits['largest-contentful-paint'],
        'cumulative-layout-shift': lhr.audits['cumulative-layout-shift'],
        'server-response-time': lhr.audits['server-response-time'],
        'max-potential-fid': lhr.audits['max-potential-fid'],
        'interactive': lhr.audits['interactive'],
        'total-blocking-time': lhr.audits['total-blocking-time'],
        'speed-index': lhr.audits['speed-index'],
      }
    }

    console.log(JSON.stringify(data))

    return callback(null, { data })
  } catch(error) {
    console.log(error)
    return callback(error);
  }
}
