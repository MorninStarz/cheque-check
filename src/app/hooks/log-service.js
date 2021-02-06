// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
const util = require('util');
const _ = require('lodash');
const logger = require('../../logger');
// To see more detailed messages, uncomment the following line:
// logger.level = 'debug';

function serializeQuery(obj) {
  const str = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const p in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}

module.exports = function () {
  return (context) => {
    // This debugs the service call and a stringified version of the hook context
    // You can customize the message (and logger) to your needs
    const path = _.omit(context.params.query, 'is_active');
    logger.info(JSON.stringify({
      type: 'API',
      uri: _.get(context, 'params.headers.host', '') + '/' + context.path + '/' + serializeQuery(path),
      level: 'INFO',
      correlationid: _.get(context.params.headers, 'correlationid', ''),
      message: `${context.type} app.service('${context.path}').${context.method}()`,
      post_data: _.get(context.arguments[1], 'info', _.get(context.arguments[0], 'info', '')),
      scheme: _.get(context.params.headers, 'x-forwarded-proto', ''),
      proto: _.get(context.params.headers, 'x-forwarded-proto', ''),
      authorization: _.get(context.params.headers, 'authorization', ''),
      method: _.get(context, 'method', ''),
      remote_addr: _.get(context.params, 'ip', ''),
      user_agent: _.get(context.params.headers, 'user-agent', ''),
      timestamp: new Date().toString(),
      response: context.result
    }));
    if (typeof context.toJSON === 'function' && logger.level === 'debug') {
      logger.debug('Hook Context', util.inspect(context, {
        colors: false
      }));
    }
    if (context.error) {
      logger.error(JSON.stringify({
        type: 'API',
        uri: _.get(context, 'params.headers.host', '') + '/' + context.path + '/' + serializeQuery(path),
        level: 'ERROR',
        correlationid: _.get(context.params.headers.correlationid, 'correlationid', ''),
        message: _.get(context, 'error.stack', ''),
        post_data: _.get(context.arguments[1], 'info', _.get(context.arguments[0], 'info', '')),
        scheme: _.get(context.params.headers, 'x-forwarded-proto', ''),
        proto: _.get(context.params.headers, 'x-forwarded-proto', ''),
        authorization: _.get(context.params.headers, 'authorization', ''),
        method: _.get(context, 'method', ''),
        remote_addr: _.get(context.params, 'ip', ''),
        user_agent: _.get(context.params.headers, 'user-agent', ''),
        timestamp: new Date().toString(),
        response: context.result
      }));
    }
  };
};
