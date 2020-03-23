'use strict';

const _ = require('lodash');

module.exports = {
  name: 'volume',
  description: 'Control the volume of the bot.',
  usage: '[percentage 0 - 100]',
  args: true,
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    if (!message.member.voice.channel) {
      return await message
          .reply('You have to be in a voice channel to skip the music!');
    }
    const serverQueue = _.invoke(message,
        'client.musicQueue.get', message.guild.id);
    if (serverQueue) {
      const percentage = _.clamp(_.first(args), 0, 100);
      _.set(serverQueue, 'volume', percentage/100);
      _.invoke(serverQueue,
          'connection.dispatcher.setVolumeLogarithmic', percentage/100);
    } else {
      return await message.reply('I\'m not playing anything at the moment.');
    }
  },
};
