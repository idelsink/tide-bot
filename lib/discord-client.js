'use strict';

const Discord = require('discord.js');
const fs = require('fs');
const log = require('log4js').getLogger('discord-client');
const config = require('config');
const _ = require('lodash');
const path = require('path');

class DiscordClient {
  constructor() {
    this.client_ = new Discord.Client();
    this.client_.commands = new Discord.Collection();
    this.cooldowns_ = new Discord.Collection();
    // Load commands
    const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands'))
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      // Only load if command is enabled
      if (_.get(config, `discord.commands[${command.name}].enabled`, true)) {
        this.client_.commands.set(command.name, command);
      }
    }

    this.client_.once('ready', () => {
      log.info(`Logged in as ${this.client_.user.tag}`);
    });

    this.client_.on('error', (...args) => log.error(...args));
    this.client_.on('message', (...args) => this.message_(...args));
  }

  async login(token) {
    return this.client_.login(token);
  }
  getClientId_() {
    return this.client_.user.id;
  }
  getClientMentionString_() {
    return `<@${this.getClientId_()}>`;
  }

  // Returns the message prefix if it has one
  getPrefix_(message) {
    if (config.discord.commandPrefix.mention.enabled) {
      const matches = message.content
          .match(new RegExp(`^<@!?(${this.client_.user.id})>`));
      if (_.first(matches)) return _.first(matches);
    }
    if (config.discord.commandPrefix.text.enabled &&
      message.content
          .startsWith(config.discord.commandPrefix.text.value)) {
      return config.discord.commandPrefix.text.value;
    }
    return null; // Default
  }

  // Returns all the arguments after the prefix
  getArguments_(message) {
    return message.content
        .slice(this.getPrefix_(message).length)
        .match(/\S+/g) || []; // Split using spaces
  }

  getCommand_(message) {
    const args = this.getArguments_(message);
    return {
      name: args.shift().toLowerCase(),
      args: args,
      message: message,
    };
  }

  async executeCommand_({name, args, message}) {
    const command = this.client_.commands.get(name) ||
      this.client_.commands.find((cmd) =>
        cmd.aliases && cmd.aliases.includes(name));
    if (!command) {
      log.debug(`Command with ${name}: [${args}] not found.`);
      return;
    }

    if (!this.cooldowns_.has(command.name)) {
      this.cooldowns_.set(command.name, new Discord.Collection());
    }

    const cooldown = (command.cooldown ||
      config.discord.commands.default.cooldown) * 1000; // To seconds

    if (cooldown) {
      const now = Date.now();
      const timestamps = this.cooldowns_.get(command.name);

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldown;

        if (now < expirationTime) {
          log.debug(`Command with ${name}: [${args}] has active cooldown.`);
          return; // Just silently return, ignore the spam
        }
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldown);
    }

    if (command.guildOnly && message.channel.type !== 'text') {
      return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length) {
      await message.channel
          .send(`You didn't provide any arguments, ${message.author}!`);
      if (command.usage) {
        await message.channel
            .send(`The proper usage would be:` +
              `\`<prefix> ${command.name} ${command.usage}\``);
      }
    }

    try {
      command.execute({message, args});
    } catch (error) {
      log.error(error);
      await message.reply('There was an error trying to execute that command!');
    }
  }


  async message_(message) {
    if (message.author.bot) return; // Bot user
    if (this.getPrefix_(message) === null) {
      log.debug(`Command has no correct prefix, ignoring.`);
      return;
    }
    await this.executeCommand_(this.getCommand_(message));
  }
}

module.exports = DiscordClient;
