const Promise = require('bluebird');
const Https = require('https');
const Axios = require('axios');
const _ = require('lodash');

class Proxmox {
  constructor (options) {
    this.username = _.get(options, 'username');
    this.password = _.get(options, 'password');
    this.domain = _.get(options, 'domain');
  }

  get username () { return this.username_; }
  set username (val) {
    if (!_.isUndefined(val)) {
      this.username_ = val;
    }
  }
  get password () { return this.password_; }
  set password (val) {
    if (!_.isUndefined(val)) {
      this.password_ = val;
    }
  }
  get domain () { return this.domain_; }
  set domain (val) {
    if (!_.isUndefined(val)) {
      this.domain_ = val;
    }
  }

  createRequestObject (method, path, { headers } = { headers: {} }) {
    const agent = new Https.Agent({
      rejectUnauthorized: false
    });
    return {
      url: `${this.domain}/api2/json${path}`,
      httpsAgent: agent,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
  }
  get accessTicket () {
    if (this.accessTicket_) {
      return Promise.resolve(this.accessTicket_);
    } else {
      return Axios({
        ...this.createRequestObject('post', '/access/ticket'),
        params: {
          username: this.username,
          password: this.password
        }
      }).then(r => {
        this.accessTicket_ = _.get(r, 'data.data');
        return this.accessTicket;
      });
    }
  }
  get csrfPreventionToken () {
    return this.accessTicket.then(r => _.get(r, 'CSRFPreventionToken'));
  }
  get ticket () {
    return this.accessTicket.then(r => _.get(r, 'ticket'));
  }

  makeRequest (method, path, config) {
    return this.accessTicket
      .then(accessTicket => {
        return Axios({
          ...this.createRequestObject(method, path, { headers: {
            ..._.get(config, 'headers'),
            ...(_.includes(['post', 'put', 'delete'], method) ? { CSRFPreventionToken: accessTicket.CSRFPreventionToken } : {}),
            Cookie: `PVEAuthCookie=${accessTicket.ticket}`
          } }),
          ..._.omit(config, 'headers')
        });
      })
      .then(r => _.get(r, 'data'));
  }
}

module.exports = Proxmox;
