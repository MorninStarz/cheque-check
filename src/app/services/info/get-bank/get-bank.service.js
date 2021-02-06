import hooks from './get-bank.hooks';

export default function (app) {
  // Initialize our service with any options it requires
  app.use('get-bank', {
    find(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('get-bank');
  service.hooks(hooks);
}
