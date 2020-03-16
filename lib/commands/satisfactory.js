'use strict';

const config = require('config');
const _ = require('lodash');
const Proxmox = require('../proxmox');

const proxmox = new Proxmox({
  username: config.proxmox.username,
  password: config.proxmox.password,
  domain: config.proxmox.domain,
});

module.exports = {
  name: 'satisfactory',
  description: 'Manage the tide Satisfactory server!',
  usage: '[start, stop, status]',
  aliases: ['factorio', 'sf'],
  args: true,
  requiredChannelPermissions: ['SEND_MESSAGES'],
  async execute({message, args}) {
    const action = _.head(args);

    if (!_.includes(['start', 'stop', 'status'], action)) return;

    switch (_.head(args)) {
      case 'start':
        await message.channel.send(`Starting server... Please stand by.`);
        await proxmox.makeRequest('post', '/nodes/tide/qemu/100/status/start');
        await message.channel.send(`Server has been started!`);
        break;
      case 'stop':
        await message.channel.send(`Shutting down server...`);
        await proxmox
            .makeRequest('post', '/nodes/tide/qemu/100/status/shutdown');
        await message.channel.send(`Shutdown request has been send!`);
        break;
      case 'status': {
        const result = await proxmox
            .makeRequest('get', '/nodes/tide/qemu/100/status/current');
        await message.channel
            .send(`Current status is '${_.get(result, 'data.status', null)}'`);
        break;
      }
      default:
    }
  },
};
