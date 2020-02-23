'use strict';

const _ = require('lodash');
const config = require('config');
const log4js = require('log4js');

function initializeLog() {
  let pattern = '%d{ISO8601_WITH_TZ_OFFSET} %-5p %c - ';
  if (config.log.useConsoleColors) {
    pattern = `%[${pattern}%]`;
  }
  pattern += '%m';

  log4js.configure({
    appenders: {
      stdoutAppender: {
        type: 'stdout',
        layout: {type: 'pattern', pattern},
      },
    },
    categories: {
      default: {
        appenders: ['stdoutAppender'],
        level: config.log.level,
      },
    },
  });
}

module.exports = _.once(initializeLog);
