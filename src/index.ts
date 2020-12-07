import { google } from 'googleapis'
import { getAuthClient } from './lib/auth'
import { getParameter } from './lib/ssm'
import { runLighthouse } from './lib/lighthouse'
import { Sheet } from './lib/sheet'
import { Callback } from 'aws-lambda'

require('dotenv').config()

exports.handler = async (_: any, __: any, callback: Callback) => {
  let response = null

  try {
    const targetUrl = process.env.TARGET_URL

    if (!targetUrl) {
      throw new Error('target URL is not set.')
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

    const sheetId = process.env.SPREAD_SHEET_ID

    if (!sheetId) {
      throw new Error('spread sheet ID is not set.')
    }

    const emailParameter = process.env.SSM_NAME_FOR_CLIENT_EMAIL

    if (!emailParameter) {
      throw new Error('aws ssm parameter name for client email is not set.')
    }

    const clientEmail = await getParameter(emailParameter)

    if (!clientEmail) {
      throw new Error('google jwt client email is failed to get.')
    }

    const keyParameter = process.env.SSM_NAME_FOR_CLIENT_KEY

    if (!keyParameter) {
      throw new Error('aws ssm parameter name for client key is not set.')
    }

    const clientKey = await getParameter(keyParameter)

    if (!clientKey) {
      throw new Error('google jwt client key is failed to get.')
    }

    const client = await getAuthClient({
      clientEmail,
      clientKey: clientKey.replace(/\\n/g, '\n')
    })
    const sheetClient = google.sheets({
      version: 'v4',
      auth: client,
    })

    const sheet = new Sheet(sheetClient, sheetId)
    response = await sheet.addRow([
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
    ])
  } catch(error) {
    console.log(error)
    return callback(error);
  }

  console.log(response.data)
  return callback(null, response.data);
}
