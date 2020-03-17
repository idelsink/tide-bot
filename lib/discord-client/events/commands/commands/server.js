'use strict';

const Discord = require('discord.js');
const _ = require('lodash');

const SERVER_REGIONS = {
  'brazil': ':flag_br: Brazil',
  'europe': ':flag_eu: Europe',
  'hongkong': ':flag_hk: Hong Kong',
  'india': ':flag_in: India',
  'japan': ':flag_jp: Japan',
  'russia': ':flag_ru: Russia',
  'singapore': ':flag_sg: Singapore',
  'southafrica': ':flag_za:  South Africa',
  'sydney': ':flag_au: Sydney',
  'us-central': ':flag_us: U.S. Central',
  'us-east': ':flag_us: U.S. East',
  'us-south': ':flag_us: U.S. South',
  'us-west': ':flag_us: U.S. West',
};

module.exports = {
  name: 'server',
  guildOnly: true,
  description: 'Display info about this server.',
  requiredChannelPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
  async execute({message}) {
    const embed = new Discord.MessageEmbed()
        .setColor('LUMINOUS_VIVID_PINK')
        .setAuthor(message.client.user.username,
            message.client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL())
        .setTitle(message.guild.name)
        .setDescription('Server information')
        .addField('Name', message.guild.name, true)
        .addField('ID', message.guild.id, true)
        .addField('Owner', message.guild.owner, true)
        .addField('Region',
            _.get(SERVER_REGIONS, message.guild.region, message.guild.region),
            false)
        .addField('Total members', message.guild.members.cache.size, true)
        .addField('Humans :bust_in_silhouette:',
            message.guild.members.cache.filter(
                (member) => !member.user.bot).size, true)
        .addField('Bots :robot:',
            message.guild.members.cache.filter(
                (member) => member.user.bot).size, true)
        .addField('\u200b', '\u200b')
        .addField('Creation Date',
            message.channel.guild.createdAt.toDateString(), true)
        .addField('Channels',
            message.guild.channels.cache.size, true)
        .addField('Verification Level', _.get({
          'NONE': 'None',
          'LOW': 'Low',
          'MEDIUM': 'Medium',
          'HIGH': '(╯°□°）╯︵  ┻━┻',
          'VERY_HIGH': '┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻',
        }, message.guild.verificationLevel, 'None'), true);
    await message.channel.send({embed});
  },
};
