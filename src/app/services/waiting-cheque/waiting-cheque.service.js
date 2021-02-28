// Initializes the `users` service on path `/users`
import hooks from './waiting-cheque.hooks';

export default function (app) {
  app.use('waiting-cheque', {
    find(data, params) {
      return Promise.resolve({});
    },
    patch(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('waiting-cheque');
  service.hooks(hooks);
}
