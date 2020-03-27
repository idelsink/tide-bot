'use strict';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const frames = [
  '(-°□°)-  ┬─┬',
  '(╯°□°)╯    ]',
  '(╯°□°)╯  ︵  ┻━┻',
  '(╯°□°)╯       [',
  '(╯°□°)╯           ┬─┬',
];

module.exports = {
  name: 'tableflip',
  aliases: ['tf', `flip`],
  description: 'Table flip! (Thanks to github.com/Katrixerse/Orcinus)',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    const m = await message.channel.send('(\\\\°□°)\\\\  ┬─┬');
    for (const frame of frames) {
      await sleep(500);
      await m.edit(frame);
    }
  },
};
