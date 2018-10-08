const { ExitPoint } = require('@hmcts/one-per-page');
const config = require('config');
const idam = require('services/idam');
const preserveSession = require('middleware/preserveSession');

class Exit extends ExitPoint {
  static get path() {
    return config.paths.exit;
  }

  get case() {
    return this.req.preservedSession.case.data;
  }

  get middleware() {
    return [
      idam.protect(),
      preserveSession,
      ...super.middleware,
      idam.logout()
    ];
  }
}

module.exports = Exit;
