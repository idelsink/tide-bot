'use strict';

const Discord = require('discord.js');

module.exports = {
  name: 'channel',
  guildOnly: true,
  description: 'Display info about this channel.',
  requiredChannelPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
  async execute({message}) {
    const embed = new Discord.MessageEmbed()
        .setColor('LUMINOUS_VIVID_PINK')
        .setAuthor(message.client.user.username,
            message.client.user.displayAvatarURL())
        .setTitle(message.channel.name)
        .setDescription('Channel information')
        .addField('Name', message.channel.name, true)
        .addField('ID', message.channel.id, true)
        .addField('NSFW', message.channel.nsfw ? 'Yes :warning:' : 'No', true)
        .addField('Topic', message.channel.topic || '*Topic not set*', true)
        .addField('Total members', message.channel.members.size, true)
        .addField('Humans :bust_in_silhouette:',
            message.channel.members.filter(
                (member) => !member.user.bot).size, true)
        .addField('Bots :robot:',
            message.channel.members.filter(
                (member) => member.user.bot).size, true)
        .addField('\u200b', '\u200b')
        .addField('Creation Date',
            message.channel.createdAt.toDateString(), true);
    await message.channel.send({embed});
  },
};
