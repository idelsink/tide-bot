'use strict';

const _ = require('lodash');
const Discord = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Lists the current queue.',
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    if (!message.member.voice.channel) {
      return await message
          .reply('You have to be in a voice channel to stop the music!');
    }
    const serverQueue = _.invoke(message,
        'client.musicQueue.get', message.guild.id);
    if (serverQueue) {
      const songs = serverQueue.songs || [];
      if (_.isEmpty(songs)) {
        return await message
            .reply('The queue is empty.');
      } else {
        const nowPlaying = _.first(songs);
        const queuedSongs = songs.slice(1, serverQueue.songs.length);
        const embed = new Discord.MessageEmbed();
        embed.setColor('LUMINOUS_VIVID_PINK');
        embed.setAuthor(nowPlaying.videoDetails.author.name,
            _.last(nowPlaying.videoDetails.author.thumbnails).url,
            nowPlaying.videoDetails.author.channel_url ||
            nowPlaying.videoDetails.author.user_url);
        embed.setTitle(`:musical_note: Now playing :musical_note:`);
        embed.setDescription(nowPlaying.videoDetails.title);
        embed.setURL(nowPlaying.videoDetails.video_url);
        embed.setThumbnail(
            _.last(nowPlaying.videoDetails.thumbnail.thumbnails).url);
        // Show queue
        if (!_.isEmpty(queuedSongs)) {
          const visibleInQueue = 8;
          embed.addField('Queued songs',
              _.map(_.take(queuedSongs, visibleInQueue), (song, index) => {
                return `${index+1}. `+
                `[${song.videoDetails.title}](${song.videoDetails.video_url})`;
              }).join('\n'),
              true);
          if (_.size(queuedSongs) > visibleInQueue) {
            embed.setFooter(`And ${_.size(queuedSongs)-visibleInQueue} more`);
          }
        }
        await message.channel.send(embed);
      }
    } else {
      return await message.reply('I\'m not playing anything at the moment.');
    }
  },
};
