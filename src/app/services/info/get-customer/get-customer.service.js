import hooks from './get-customer.hooks';

export default function (app) {
  // Initialize our service with any options it requires
  app.use('get-customer', {
    find(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('get-customer');
  service.hooks(hooks);
}
