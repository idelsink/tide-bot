'use strict';

const _ = require('lodash');
const axios = require('axios');
const Discord = require('discord.js');
const ICanHazDadJoke = require('@ffflorian/icanhazdadjoke').ICanHazDadJoke;
const iCanHazDadJoke = new ICanHazDadJoke();


module.exports = {
  name: 'dad',
  guildOnly: true,
  description: 'I can haz dad joke? (icanhazdadjoke.com)',
  usage: '[optional search query]',
  requiredChannelPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
  async execute({message, args}) {
    const term = args.join(' ');
    let result = {};
    if (!_.isEmpty(term)) {
      result = _.sample(_.get(
          await axios.get('https://icanhazdadjoke.com/search', {
            headers: {'Accept': 'application/json'},
            params: {
              limt: 10,
              term,
            },
          }),
          'data.results',
          []));
    } else {
      result = await iCanHazDadJoke.api.getRandom({
        withImage: false,
      });
    }

    // A way to get the question out of the joke...
    const dadJoke = _.get(result,
        'joke',
        'I did not find a joke with that search query.')
        .split('?');
    const joke = dadJoke.shift();
    const punchline = dadJoke.join('?');

    const embed = new Discord.MessageEmbed()
        .setColor('LUMINOUS_VIVID_PINK')
        .setAuthor(message.client.user.username,
            message.client.user.displayAvatarURL())
        .setTitle(`${joke}${punchline ? '?' : ''}`)
        .setURL(`https://icanhazdadjoke.com${_.has(result, 'id')?'/j/'+result.id:''}`)
        .setDescription(punchline);

    await message.channel.send({embed});
  },
};
