'use strict';

const Discord = require('discord.js');
const Promise = require('bluebird');
const _ = require('lodash');
const log = require('log4js').getLogger('music-play');
const ytdl = require('ytdl-core-discord');
const ytpl = require('ytpl');

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
      const visibleInQueue = 8;
      embed.addField('Queued songs',
          _.map(_.take(queuedSongs, visibleInQueue), (song, index) => {
            return `${index+1}. [${song.title}](${song.video_url})`;
          }).join('\n'),
          true);
      if (_.size(queuedSongs) > visibleInQueue) {
        embed.setFooter(`And ${_.size(queuedSongs)-visibleInQueue} more`);
      }
    }
    await message.channel.send(embed);
  }

  const dispatcher = serverQueue.connection
      .play(await ytdl(song.video_url), {type: 'opus'});
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
    const argument = _.first(args);
    if (_.isEmpty(argument)) {
      return;
    }

    const songInfos = [];

    if (ytpl.validateURL(argument)) {
      log.debug('Argument is a YouTube playlist');
      try {
        const playlist = await ytpl(await ytpl.getPlaylistID(argument));

        await message.reply(
            `Fetching ${_.size(playlist.items)} songs ` +
            `and adding them to the queue. `+
            `Hold on, this might take some time!`,
        );
        const songs = _.compact(await Promise.map(playlist.items, (item) => {
          console.debug(`Fetching ${item.id}`);
          return ytdl.getInfo(item.url).catch((e) => {
            log.error('Failed to download song', e);
            return null;
          });
        }, {
          concurrency: 20,
        }));
        log.debug(`Fetched all ${_.size(songs)} songs`);
        songInfos.push(...songs);
      } catch (e) {
        log.info('Failed to fetch YouTube playlist, ' +
        'adding it as a single video', e);
        songInfos.push(await ytdl.getInfo(argument));
      }
    } else if (ytdl.validateURL(argument)) {
      log.debug('Argument is a YouTube video');
      songInfos.push(await ytdl.getInfo(argument));
    }

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
        volume: 0.5, // 50% volume seems the best default in the channel
        playing: true,
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(...songInfos);

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
      serverQueue.songs.push(...songInfos);
      if (_.size(songInfos) > 1) {
        return await message.reply(
            `${_.size(songInfos)} songs have been added to the queue!`,
        );
      } else {
        return await message.reply(
            `${_.first(songInfos).title} has been added to the queue!`,
        );
      }
    }
  },


};
