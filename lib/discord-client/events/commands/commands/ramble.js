'use strict';

const _ = require('lodash');
const axios = require('axios');
const config = require('config');
const fs = require('fs');

const loadRamblings = _.once(async () => {
  const source = _.get(config, 'discord.commands.ramble.ramblings');
  if (_.isArray(source)) return source;
  if (_.startsWith(source, 'https://')) {
    const result = await axios.get(source);
    return _.isArray(result.data) ? result.data : JSON.parse(result.data);
  }
  if (_.startsWith(source, 'file://')) {
    const result = await fs.promises.readFile(source.substr(7));
    return JSON.parse(result);
  }
  throw new Error('Unsupported rambling source');
});

module.exports = {
  name: 'ramble',
  aliases: ['rambling'],
  description: 'Show a random rambling',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    let output = 'No rambling found. Todo: check if this works as intended. ' +
      'Did we even implement this undocumented feature?!';
    const lowercaseArgs = _.map(args, (arg) => arg.toLowerCase());
    const ramblings = _.filter(await loadRamblings(), (text) => {
      if (!_.isString(text)) return false;
      if (_.isEmpty(args)) return true;
      const lowercaseText = text.toLowerCase();
      return _.some(lowercaseArgs, (searchTerm) => _.includes(lowercaseText, searchTerm));
    });
    if (!_.isEmpty(ramblings)) {
      output = _.sample(ramblings);
    }
    await message.channel.send(output);
  },
};
