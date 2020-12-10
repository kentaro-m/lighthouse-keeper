import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

type AuthClientOptions = {
  clientEmail: string
  clientKey: string
}

export async function getAuthClient(options: AuthClientOptions) {
  const client = new google.auth.JWT({
    email: options.clientEmail,
    key: options.clientKey,
    scopes: SCOPES,
  })

  return client
}