/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-global-assign */
require('@babel/polyfill/noConflict');

require('@babel/register', {
  cache: false
});

require('dotenv').config();
require('better-require')();
require = require('esm')(module);
// eslint-disable-next-line import/first
const moment = require('moment');
const config = require('config');
const fs = require('fs');
const logger = require('./logger');

// let apm;
// if (config.get('apm_addr').length > 0) {
//   apm = require('elastic-apm-node').start({
//     // Override service name from package.json
//     // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//     serviceName: config.get('name'),

//     // Use if APM Server requires a token
//     secretToken: config.get('apm_token'),

//     // Set custom APM Server URL (default: http://localhost:8200)
//     serverUrl: config.get('apm_addr')
//   });
// }

const portApp = config.get('port');
const hostApp = config.get('host');
const appEngine = require('./app/app');

const serverAdmin = appEngine.listen(portApp);
process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason));
serverAdmin.on('listening', () => logger.info('Cheque Check Application Started on http://%s:%d', config.get('host'), portApp));

const message = [
  '------------------------------------',
  '      env : ' + process.env.NODE_ENV,
  '      url : ' + hostApp,
  '     port : ' + portApp,
  '  started : ' + moment().format('YYYY-MM-DD HH:mm:ss Z'),
  '------------------------------------',
];
logger.info(message.join('\n'));
