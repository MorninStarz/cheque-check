// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './branch.hooks';
import createModel from '../../models/branch.model';

const { Branch } = require('./branch.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('branch', new Branch(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('branch');
  service.hooks(hooks);
}
