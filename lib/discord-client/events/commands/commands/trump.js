'use strict';

const Discord = require('discord.js');
const axios = require('axios');
const _ = require('lodash');

module.exports = {
  name: 'tronald',
  aliases: ['donald', 'trump'],
  description: 'Tronald Dump; Api & web archive for the '+
    'dumbest things Donald Trump has ever said.',
  requiredChannelPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
  async execute({message}) {
    const host = 'https://api.tronalddump.io';

    const quote = _.get(await axios.get(`${host}/random/quote`, {
      headers: {'Accept': 'application/json'},
    }), 'data', null);

    if (quote) {
      const embed = new Discord.MessageEmbed()
          .setColor('#D6AC84')
          .setAuthor('Tronald Dump',
              'https://avatars0.githubusercontent.com/u/23418820')
          .setTimestamp(quote.created_at)
          .setDescription(`${quote.value}\n`+
            `[tronalddump.io/quote/${quote.quote_id}]`+
            `(${host}/quote/${quote.quote_id})`);
      await message.channel.send({embed});
    } else {
      await message.reply('I did not find a quote.');
    }
  },
};
