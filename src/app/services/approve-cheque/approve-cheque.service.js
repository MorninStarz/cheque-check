// Initializes the `users` service on path `/users`
import hooks from './approve-cheque.hooks';

export default function (app) {
  app.use('approve-cheque', {
    find(data, params) {
      return Promise.resolve({});
    },
    patch(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('approve-cheque');
  service.hooks(hooks);
}
