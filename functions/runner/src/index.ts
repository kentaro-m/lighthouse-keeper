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

    const {
      'first-contentful-paint': fcp,
      'largest-contentful-paint': lcp,
      'cumulative-layout-shift': cls,
      'server-response-time': ttfb,
      'max-potential-fid': fid,
      'interactive': tti,
      'total-blocking-time': tbt,
      'speed-index': speedIndex,
    } = result.lhr.audits

    const values = [
      result.lhr.finalUrl,
      result.lhr.fetchTime,
      result.lhr.userAgent,
      fcp.numericValue,
      lcp.numericValue,
      cls.numericValue,
      ttfb.numericValue,
      fid.numericValue,
      tti.numericValue,
      tbt.numericValue,
      speedIndex.numericValue
    ]

    return callback(null, { data: values })
  } catch(error) {
    console.log(error)
    return callback(error);
  }
}
