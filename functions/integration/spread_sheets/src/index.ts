import { google } from 'googleapis'
import { Handler } from 'aws-lambda'
import { Sheet } from './lib/sheet'
import { getAuthClient } from './lib/auth'
import { getParameter } from './lib/ssm'

export const handler: Handler = async (event, __, callback) => {
  console.log(JSON.stringify(event))

  try {
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
    const response = await sheet.addRow(event.data)
    console.log(response.data)

    return callback(null)
  } catch (error) {
    console.log(error)
    return callback(error)
  }
}