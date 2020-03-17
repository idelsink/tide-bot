'use strict';

const _ = require('lodash');
const config = require('config');
const Discord = require('discord.js');
const fs = require('fs');
const log = require('log4js').getLogger('events.commands');
const path = require('path');

const commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const files = fs.readdirSync(path.resolve(__dirname, 'commands'));
for (const file of files) {
  const command = require(`./commands/${file}`);
  // Only load if command is enabled
  if (_.get(config, `discord.commands[${command.name}].enabled`, true)) {
    commands.set(command.name, command);
  }
}

const isChannelEnabled = (message) => {
  if (message.guild) {
    const guilds = config.discord.guilds;
    return _.get(guilds,
        `${message.guild.id}.channels.${message.channel.id}.enabled`,
        _.get(guilds, `${message.guild.id}.channels.default.enabled`,
            _.get(guilds, `default.channels.default.enabled`, true),
        ),
    );
  } else { // DM
    return true;
  }
};

// Returns the message prefix if it has one
const getPrefix =(message) => {
  if (config.discord.commandPrefix.mention.enabled) {
    const matches = message.content
        .match(new RegExp(`^<@!?(${message.client.user.id})>`));
    if (_.first(matches)) return _.first(matches);
  }
  if (config.discord.commandPrefix.text.enabled &&
    message.content
        .startsWith(config.discord.commandPrefix.text.value)) {
    return config.discord.commandPrefix.text.value;
  }
  return null; // Default
};

const executeCommand = async ({name, args, message}) => {
  const command = commands.get(name) ||
    commands.find((cmd) =>
      cmd.aliases && cmd.aliases.includes(name));
  if (!command) {
    log.debug(`Command with ${name}: [${args}] not found.`);
    return;
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const cooldown = (command.cooldown ||
    config.discord.commands.default.cooldown) * 1000; // To seconds

  if (cooldown) {
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);

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

  // Verify that the bot has the required permissions
  if (message.guild) {
    if (!message.guild.me.permissionsIn(message.channel)
        .has(command.requiredChannelPermissions || [])) {
      log.error(`The required channel permissions ` +
        `'[${command.requiredChannelPermissions}]' `+
        `are not assigned in the server `+
        `'${message.guild.name}' (${message.guild.id}).`);
      message.reply(`Not all required permissions for available to me. `+
          `(${command.requiredChannelPermissions})`);
      return;
    }
  }

  try {
    command.execute({message, args});
  } catch (error) {
    log.error(error);
    await message.reply('There was an error trying to execute that command!');
  }
};

// Returns all the arguments after the prefix
const getArguments = (message) => {
  return message.content
      .slice(getPrefix(message).length)
      .match(/\S+/g) || []; // Split using spaces
};

const getCommand = (message) => {
  const args = getArguments(message);
  return {
    name: args.shift().toLowerCase(),
    args: args,
    message: message,
  };
};

module.exports = {
  name: 'message',
  handler: async (message) => {
    if (message.author.bot) return; // Bot user
    if (!isChannelEnabled(message)) return;
    if (getPrefix(message) === null) {
      log.debug(`Command has no correct prefix, ignoring.`);
      return;
    }
    await executeCommand(getCommand(message));
  },
};
