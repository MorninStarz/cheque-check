// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './permission.hooks';
import createModel from '../../models/permission.model';

const { Permission } = require('./permission.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('permission', new Permission(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('permission');
  service.hooks(hooks);
}
