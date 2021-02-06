const config = require('config');
const emoji = require('node-emoji');
const winston = require('winston');
const util = require('util');

const {
  combine,
  printf
} = winston.format;
// const loggerDefaults = config.get('logger');

// const loggerDefaults = require('../defaults/config.json').logging

// transports object to easily override settings
const transports = {
  console: new winston.transports.Console({
    stderrLevels: ['error', 'warn'],
    json: false,
    colorize: true
  })
};

// logger module
const logger = winston.createLogger({
  // maximum log level
  level: config.get('debug') ? 'debug' : 'info',
  // clean output instead of wintons default
  format: combine(
    printf((info) => `${info.message}`)
  ),
  // basic console transport set-up
  transports: [
    transports.console
  ]
});

// pass in input object and returns string with spaces
function argumentsToString(input, type) {
  let str = '';
  // convert arguments object to array
  const args = Array.prototype.slice.call(input);
  // if the first arg is a string and the first arg isn't an emoji add the types emoji
  if (typeof args[0] === 'string' && !emoji.which(args[0])) {
    switch (type) {
      case 'warn':
        str += '⚠️   ';
        break;
      case 'error':
        str += '❌  ';
        break;
      default:
    }
  }
  // iterate through args and check for objects for proper string representation
  args.forEach((arg, k) => {
    // proper spacing if the argument is an emoji
    if (typeof args[k] === 'string' && emoji.which(args[k])) {
      // add 2 spaces after an emoji
      str += args[k] + '  ';
    } else if (typeof args[k] === 'object') {
      // if the argument is an object use the inspect utility on it
      args[k] = util.inspect(args[k], false, null, true);
      // after an object arguments add 1 space
      str += args[k] + ' ';
    } else {
      // everything else will have 1 space
      str += args[k] + ' ';
    }
  });
  // trim white space from the end of a string
  str = str.replace(/\s*$/, '');
  // return string
  return str;
}

class Logger {
  constructor(params) {
    Object.assign(this, params || {});
  }

  // default log types
  // debug logs
  debug(...args) {
    if (this.debug) {
      logger.log({
        level: 'debug',
        message: argumentsToString(args)
      });
    }
  }

  // appStatus logs
  info(...args) {
    if (this.info) {
      logger.log({
        level: 'info',
        message: argumentsToString(args)
      });
    }
  }

  // warning logs
  warn(...args) {
    if (this.warn) {
      logger.log({
        level: 'warn',
        message: argumentsToString(args, 'warn')
      });
    }
  }

  // error logs are always on by default
  error(...args) {
    if (this.error) {
      logger.log({
        level: 'error',
        message: argumentsToString(args, 'error')
      });
    }
  }
}

const _logger = new Logger({});
export default _logger;
module.exports = _logger;
