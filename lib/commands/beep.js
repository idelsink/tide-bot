'use strict';

module.exports = {
  name: 'beep',
  description: 'Beep!',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message}) {
    await message.channel.send('all the boops!');
  },
};
