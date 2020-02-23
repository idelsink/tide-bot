'use strict';

const config = require('config');
const log4js = require('log4js');
const {gitDescribe} = require('git-describe');

const initLog = require('./lib/init/log');
const DiscordClient = require('./lib/discord-client');

let log;

async function main() {
  const [gitInfo] = await Promise.all([
    gitDescribe(__dirname),
    initLog(),
  ]);
  log = log4js.getLogger('main');
  log.info(`Starting tide-bot version: ${gitInfo.semverString}`);
  const client = new DiscordClient();
  client.login(config.discord.token);
}

main()
    .catch((err) => {
      if (log) {
        log.fatal(err);
      } else {
        console.log(err);
      }
      process.exit(3);
    });
