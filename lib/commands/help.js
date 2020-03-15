'use strict';

const log = require('log4js').getLogger('commands.help');
const _ = require('lodash');

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 0,
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    const {commands} = message.client;

    if (!args.length) {
      // Display generic help
      try {
        await message.author.send(
            '**Tide bot help**\n\n' +
            '> Command syntax: `<prefix> <command> <arguments>`\n\n' +
            'Example\n' +
            '> `.help help`\n' +
            'Available commands: \n' +
            commands.map((c) => `> \`${c.name}\` ${c.description}\n`).join(''),
            {split: true});
      } catch (e) {
        log.error(`Could not send help DM to ${message.author.tag}.\n`,
            e);
        message.reply(`It seems like I can't DM you!`);
      }
    } else {
      // Display specific help
      const name = _.head(args).toLowerCase();
      const command = commands.get(name) ||
        commands.find((c) => c.aliases && c.aliases.includes(name));
      if (command) {
        await message.author.send(
            `**Name:** ${command.name}\n` +
            `**Aliases:** ${command.aliases.join(', ')}\n` +
            `**Description:** ${command.description}\n` +
            `**Usage:** \`<prefix> ${command.name} ${command.usage}\`\n`,
            {split: true});
      } else {
        await message.reply(`${name} is not a valid command!`);
      }
    }
  },
};
