// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './transaction.hooks';
import createModel from '../../models/transaction.model';

const { Transaction } = require('./transaction.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('transaction', new Transaction(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transaction');
  service.hooks(hooks);
}
