'use strict';

module.exports = {
  name: 'beep',
  description: 'Beep!',
  async execute({message}) {
    message.channel.send('all the boops!');
  },
};
