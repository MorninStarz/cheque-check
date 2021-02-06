import hooks from './authenticate.hooks';

export default function (app) {
  // Initialize our service with any options it requires
  app.use('authenticate', {
    create(data, params) {
      return Promise.resolve({});
    },
    patch(data, params) {
      return Promise.resolve({});
    },
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('authenticate');
  service.hooks(hooks);
}
