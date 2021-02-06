const useragent = require('useragent');
const woothee = require('woothee');

export default function attachRequestHeadersUserAgent() {
  const app = this;
  app.use((req, res, next) => {
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.feathers.ip = ip;
    const rawUserAgent = useragent.parse(req.headers['user-agent']);
    const source = rawUserAgent.source || '';
    const resultUserAgent = {
      ...rawUserAgent,
      ...woothee.parse(source)
    };
    req.feathers.userAgent = resultUserAgent;
    next();
  });
}
