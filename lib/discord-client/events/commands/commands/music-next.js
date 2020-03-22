'use strict';

const _ = require('lodash');

module.exports = {
  name: 'skip',
  aliases: ['next'],
  description: 'Skip this songs and play the next one in the queue.',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    if (!message.member.voice.channel) {
      return await message
          .reply('You have to be in a voice channel to skip the music!');
    }
    const serverQueue = message.client.musicQueue.get(message.guild.id);
    if (serverQueue) {
      _.invoke(serverQueue, 'connection.dispatcher.end');
      _.invoke(serverQueue, 'connection.dispatcher.destroy');
    }
  },
};
