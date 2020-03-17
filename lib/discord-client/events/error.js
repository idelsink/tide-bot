'use strict';

const log = require('log4js').getLogger('event.error');

module.exports = {
  name: 'error',
  handler: async (...args) => {
    log.error(...args);
  },
};
