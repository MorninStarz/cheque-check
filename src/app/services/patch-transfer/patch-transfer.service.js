// Initializes the `users` service on path `/users`
import hooks from './patch-transfer.hooks';

export default function (app) {
  app.use('patch-transfer', {
    create(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('patch-transfer');
  service.hooks(hooks);
}
