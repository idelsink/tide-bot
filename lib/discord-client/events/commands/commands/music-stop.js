'use strict';

const _ = require('lodash');

module.exports = {
  name: 'stop',
  description: 'Stop all songs in the queue.',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    if (!message.member.voice.channel) {
      return await message
          .reply('You have to be in a voice channel to stop the music!');
    }
    const serverQueue = _.invoke(message,
        'client.musicQueue.get', message.guild.id);
    if (serverQueue) {
      serverQueue.songs = [];
      _.invoke(serverQueue, 'connection.dispatcher.end');
      _.invoke(serverQueue, 'connection.dispatcher.destroy');
    }
  },
};
