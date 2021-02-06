// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './customer.hooks';
import createModel from '../../models/customer.model';

const { Customer } = require('./customer.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('customer', new Customer(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('customer');
  service.hooks(hooks);
}
