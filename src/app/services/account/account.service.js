// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './account.hooks';
import createModel from '../../models/account.model';

const { Account } = require('./account.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('account', new Account(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('account');
  service.hooks(hooks);
}
