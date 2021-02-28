// Initializes the `users` service on path `/users`
import hooks from './patch-transfer-unset.hooks';

export default function (app) {
  app.use('patch-transfer-unset', {
    create(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('patch-transfer-unset');
  service.hooks(hooks);
}
