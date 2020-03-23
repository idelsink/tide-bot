'use strict';

const Discord = require('discord.js');
const _ = require('lodash');
const ytdl = require('ytdl-core');
const log = require('log4js').getLogger('music-play');

const play = async ({message}) => {
  const queue = message.client.musicQueue;
  const guild = message.guild;
  const serverQueue = queue.get(message.guild.id);

  const song = _.first(serverQueue.songs);
  const queuedSongs = serverQueue.songs.slice(1, serverQueue.songs.length);

  if (!song) {
    log.debug('No song, leaving channel');
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  } else {
    const embed = new Discord.MessageEmbed();
    embed.setColor('LUMINOUS_VIVID_PINK');
    embed.setAuthor(song.author.name,
        song.author.avatar,
        song.author.channel_url || song.author.user_url);
    embed.setTitle(`:musical_note: Now playing :musical_note:`);
    embed.setDescription(song.title);
    embed.setURL(song.video_url);
    embed.setThumbnail(`https://img.youtube.com/vi/${song.video_id}/0.jpg`);
    // Show queue
    if (!_.isEmpty(queuedSongs)) {
      embed.addField('Queued songs',
          _.map(queuedSongs, (song, index) => {
            return `${index+1}. [${song.title}](${song.video_url})`;
          }).join('\n'),
          true);
    }
    await message.channel.send(embed);
  }

  const dispatcher = serverQueue.connection
      .play(ytdl(song.video_url, {filter: 'audioonly'}));
  log.debug(`Playing song ${song.title}`);

  dispatcher.on('finish', () => {
    log.debug('Song finished');
    serverQueue.songs.shift(); // Remove played song from the queue
    play({message, song: _.first(serverQueue.songs)});
  });
  dispatcher.on('error', (error) => {
    log.error(error);
  });

  dispatcher.setVolumeLogarithmic(serverQueue.volume);
};

module.exports = {
  name: 'play',
  description: 'Play a YouTube song in your voice channel!',
  usage: '[YouTube url]',
  args: true,
  execute: async ({message, args}) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return await message.reply(
          'You need to be in a voice channel to play music!',
      );
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return await message.reply(
          'I need the permissions to join and speak in your voice channel!',
      );
    }
    if (_.isEmpty(_.first(args))) {
      return;
    }
    const songInfo = await ytdl.getInfo(_.first(args));

    if (!message.client.musicQueue) {
      message.client.musicQueue = new Map();
    }

    const queue = message.client.musicQueue;
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 1,
        playing: true,
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(songInfo);

      try {
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        await play({message});
      } catch (err) {
        log.error(err);
        queue.delete(message.guild.id);
        return await message.reply(err);
      }
    } else {
      serverQueue.songs.push(songInfo);
      return await message.reply(
          `${songInfo.title} has been added to the queue!`,
      );
    }
  },


};
