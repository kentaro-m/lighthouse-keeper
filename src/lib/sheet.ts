import { sheets_v4 } from 'googleapis'

export class Sheet {
  sheetClient: sheets_v4.Sheets
  sheetId: string

  constructor(sheetClient: sheets_v4.Sheets, sheetId: string) {
    this.sheetClient = sheetClient
    this.sheetId = sheetId
  }

  async addRow(values: string[]) {
    const params = {
      spreadsheetId: this.sheetId,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      range: 'A1',
      requestBody: {
        values: [values]
      },
    }

    return this.sheetClient.spreadsheets.values.append(params)
  }
}