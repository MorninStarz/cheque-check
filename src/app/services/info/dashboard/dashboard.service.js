import hooks from './dashboard.hooks';

export default function (app) {
  // Initialize our service with any options it requires
  app.use('dashboard', {
    find(data, params) {
      return Promise.resolve({});
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('dashboard');
  service.hooks(hooks);
}
