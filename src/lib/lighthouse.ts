const lighthouse = require('lighthouse')
const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

export async function runLighthouse(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  })

  const result = await lighthouse(url, {
    logLevel: 'info',
    onlyCategories: ['performance'],
    port: (new URL(browser.wsEndpoint())).port,
  });
  
  await browser.close();

  return result
}