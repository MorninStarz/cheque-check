// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './user.hooks';
import createModel from '../../models/user.model';

const { User } = require('./user.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('user', new User(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user');
  service.hooks(hooks);
}
