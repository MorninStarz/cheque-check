// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './login-transaction.hooks';
import createModel from '../../models/login-transaction.model';

const { LoginTransaction } = require('./login-transaction.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('login-transaction', new LoginTransaction(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('login-transaction');
  service.hooks(hooks);
}
