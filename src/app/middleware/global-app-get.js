import _ from 'lodash';

export default function globalAppGet() {
  return (app) => {
    const _app_get = app.get;
    app.get = function doGetter(path) {
      const p = path.split('.');
      if (p.length === 0) return _app_get.call(this, path);
      if (p.length === 1) return _app_get.call(this, p[0]);
      return _.get(_app_get.call(this, p[0]), p.slice(1).join('.'));
    }.bind(app);
  };
}
