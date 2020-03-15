'use strict';

module.exports = {
  name: 'ping',
  description: 'Ping!',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    message.channel.send('Pong.');
  },
};
