const Discord = require('discord.js');
const config = require('./config.js');
const fs = require('fs');
const _ = require('lodash');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Load commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.author.bot) return; // Bot user
  if (!message.content.match(new RegExp(`^<@${client.user.id}>`))) return; // Does not start with a mention

  const args = message.content.slice(`<@${client.user.id}>`.length).match(/\S+/g) || [];
  const command = _.invoke(_.invoke(args, 'shift'), 'toLowerCase');

  if (!client.commands.has(command)) return; // Does not have the command

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(config.discord.token);
