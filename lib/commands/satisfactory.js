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
        message.channel.send(`Starting server... Please stand by.`);
        proxmox.makeRequest('post', '/nodes/tide/qemu/100/status/start')
            .then((r) => {
              message.channel.send(`Server has been started!`);
            });
        break;
      case 'stop':
        message.channel.send(`Shutting down server...`);
        proxmox.makeRequest('post', '/nodes/tide/qemu/100/status/shutdown')
            .then((r) => {
              message.channel.send(`Shutdown request has been send!`);
            });
        break;
      case 'status':
        proxmox.makeRequest('get', '/nodes/tide/qemu/100/status/current')
            .then((r) => {
              const status = _.get(r, 'data.status');
              message.channel.send(`Current status is '${status}'`);
            });
        break;
      default:
    }
  },
};
