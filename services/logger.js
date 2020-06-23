const nodeJsLogging = require('@hmcts/nodejs-logging');
const { get } = require('lodash');
const urlSanitiser = require('helpers/sanitiseUrlHelper');

const buildUserInfo = req => {
  const idamId = get(req, 'idam.userDetails.id', 'unknown');
  const caseId = get(req, 'session.case.caseId', 'unknown');

  return `IDAM ID: ${idamId}, CASE ID: ${caseId}`;
};

const getLogger = name => {
  const loggerInstance = nodeJsLogging.Logger.getLogger(name);

  return {
    infoWithReq: (req, tag, message, ...args) => {
      loggerInstance.info(buildUserInfo(req), tag, message, ...args);
    },
    warnWithReq: (req, tag, message, ...args) => {
      loggerInstance.warn(buildUserInfo(req), tag, message, ...args);
    },
    errorWithReq: (req, tag, message, ...args) => {
      loggerInstance.error(buildUserInfo(req), tag, message, ...args);
    }
  };
};

const accessLogger = () => {
  return nodeJsLogging.Express.accessLogger({
    formatter: (req, res) => {
      const url = req.originalUrl || req.url;
      const sanitisedUrl = urlSanitiser.sanitiseUrl(url);
      return `${buildUserInfo(req)} - "${req.method} ${sanitisedUrl} HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}" ${res.statusCode}`;
    }
  });
};

module.exports = {
  getLogger,
  accessLogger
};
