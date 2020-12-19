const lighthouse = require('lighthouse')
const constants = require('../config/constants')
const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

export async function runLighthouse(url: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

  const result = await lighthouse(url, {
    logLevel: 'info',
    port: (new URL(browser.wsEndpoint())).port,
  }, {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance'],
      // maxWaitForFcp: 15 * 1000,
      // maxWaitForLoad: 35 * 1000,
      formFactor: 'desktop',
      throttling: constants.throttling.desktopDense4G,
      screenEmulation: constants.screenEmulationMetrics.desktop,
      emulatedUserAgent: constants.userAgents.desktop,
    },
  });
  
  await browser.close();

  return result
}