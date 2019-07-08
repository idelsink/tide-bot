/**
 * Supply the bot with the correct configuration on startup
 */
const _ = require('lodash');
require('dotenv').config(); // Load the .env file

module.exports = {
  prefix: '',
  discord: {
    token: _.get(process, 'env.DISCORD_TOKEN', '')
  },
  proxmox: {
    domain: _.get(process, 'env.PROXMOX_DOMAIN', ''),
    username: _.get(process, 'env.PROXMOX_USERNAME', ''),
    password: _.get(process, 'env.PROXMOX_PASSWORD', '')
  }
};
