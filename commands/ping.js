module.exports = {
  name: 'ping',
  aliases: ['foo', 'bar'],
  description: 'Ping!',
  args: false,
  usage: 'some test',
  guildOnly: true,
  cooldown: 1,
  execute (message, args) {
    message.channel.send('Pong.');
  }
};
