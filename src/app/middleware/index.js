import attachRequestHeadersUserAgent from './attach-user-agent';

module.exports = function (app) {
  app.configure(attachRequestHeadersUserAgent);
  // Add your custom middleware here. Remember that
  // in Express, the order matters.
};
