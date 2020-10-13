'use strict';

const _ = require('lodash');
const cowsay = require('cowsay');

// The module implemented promise support but forgot
// to make the callback optional... thus the noop
const loadFigureFilenames = _.once(() => cowsay.list(_.noop));

module.exports = {
  name: 'cowsay',
  description: 'Moo! Use "cowsay list" to see all supported figures.',
  usage: '[<figure>] <text>',
  args: true,
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    const figureFilenames = await loadFigureFilenames();
    if (_.size(args) === 1 && _.head(args) === 'list') {
      const names = _.map(figureFilenames, (str) => str.replace('.cow', ''));
      return message.channel.send(names.join(', '));
    }
    const hasFigureArg = _.includes(figureFilenames, _.head(args) + '.cow');
    const figure = hasFigureArg ? args.shift() : undefined;
    const output = cowsay.say({f: figure, text: args.join(' ')});
    await message.channel.send('```\n' + output + '\n```');
  },
};
