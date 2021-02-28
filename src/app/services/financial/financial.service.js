// Initializes the `users` service on path `/users`
import hooks from './financial.hooks';

export default function (app) {
  app.use('financial', {
    find(data, params) {
      return Promise.resolve({});
    },
    patch(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('financial');
  service.hooks(hooks);
}
