/* eslint-disable no-process-env */

const config = require('config');

const waitForTimeout = config.tests.e2e.waitForTimeout;
const waitForAction = config.tests.e2e.waitForAction;
const chromeArgs = [ '--no-sandbox' ];

if (config.environment !== 'development') {
  const proxyServer = config.tests.e2e.idam.idamTestApiProxy;
  const proxyByPass = config.tests.e2e.idam.idamTestProxyByPass;
  chromeArgs.push(`--proxy-server=${proxyServer || ''}`);
  chromeArgs.push(`--proxy-bypass-list=${proxyByPass || ''}`);
}

exports.config = {
  tests: './paths/**/*.js',
  output: config.tests.e2e.outputDir,
  helpers: {
    Puppeteer: {
      url: config.tests.e2e.url || config.node.baseUrl,
      waitForTimeout,
      waitForAction,
      show: false,
      restart: false,
      keepCookies: false,
      keepBrowserState: false,
      chrome: {
        ignoreHTTPSErrors: true,
        args: chromeArgs
      }
    },
    ElementExist: { require: './helpers/elementExist.js' },
    IdamHelper: { require: './helpers/idamHelper.js' },
    JSWait: { require: './helpers/JSWait.js' },
    UrlHelper: { require: './helpers/urlHelper.js' }
  },
  include: { I: './pages/steps.js' },
  mocha: {
    reporterOptions: {
      reportDir: process.env.E2E_OUTPUT_DIR || './functional-output',
      reportName: 'DecreeNisiFrontendTests',
      inlineAssets: true
    }
  },
  plugins: {
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true
    }
  },
  name: 'Decree Nisi Frontend Tests'
};
