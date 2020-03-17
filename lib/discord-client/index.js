'use strict';

const Discord = require('discord.js');
const fs = require('fs');
const log = require('log4js').getLogger('discord-client');
const path = require('path');

class DiscordClient {
  constructor() {
    this.client_ = new Discord.Client();

    this.client_.once('ready', () => {
      log.info(`Logged in as ${this.client_.user.tag}`);
    });

    // Load event handlers
    const events = fs.readdirSync(path.resolve(__dirname, 'events'));
    for (const file of events) {
      const event = require(`./events/${file}`);
      this.client_.on(event.name, (...args) => event.handler(...args));
    }
  }

  async login(token) {
    return this.client_.login(token);
  }
}

module.exports = DiscordClient;
