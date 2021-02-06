import hooks from './get-account.hooks';

export default function (app) {
  // Initialize our service with any options it requires
  app.use('get-account', {
    find(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('get-account');
  service.hooks(hooks);
}
