const healthcheck = require('@hmcts/nodejs-healthcheck');
const config = require('config');
const os = require('os');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const redis = require('services/redis');
const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const { OK } = require('http-status-codes');
const request = require('request-promise-native');

const options = {
  timeout: config.health.timeout,
  deadline: config.health.deadline
};

const checks = () => {
  return {
    redis: healthcheck.raw(() => {
      return redis.ping()
        .then(_ => {
          return healthcheck.status(_ === 'PONG');
        })
        .catch(error => {
          logger.error(`Health check failed on redis: ${error}`);
          return healthcheck.status(false);
        });
    }),
    'idam-web-app': healthcheck.raw(() => {
      const requestOptions = Object.assign({
        uri: config.services.idam.authenticationHealth,
        proxy: config.services.idam.proxy
      }, options);

      return request.get(
        config.services.idam.authenticationHealth,
        requestOptions
      )
        .then(body => {
          const response = JSON.parse(body);
          return healthcheck.status(response);
        })
        .catch(error => {
          logger.error(`Health check failed on idam-web-app: ${error}`);
          return healthcheck.status(false);
        });
    }),
    'idam-api': healthcheck.web(config.services.idam.apiHealth, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error(`Health check failed on idam-api: ${error}`);
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options),
    'case-orchistration-service': healthcheck.web(config.services.orchestrationService.health, {
      callback: (error, res) => { // eslint-disable-line id-blacklist
        if (error) {
          logger.error(`Health check failed on case-orchistration-service: ${error}`);
        }
        return !error && res.status === OK ? outputs.up() : outputs.down(error);
      }
    }, options)
  };
};

const setupHealthChecks = app => {
  app.use(config.paths.health, healthcheck.configure({
    checks: checks(),
    buildInfo: {
      name: config.service.name,
      host: os.hostname(),
      uptime: process.uptime()
    }
  }));
};

module.exports = setupHealthChecks;
