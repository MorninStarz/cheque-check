// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './search-customer.hooks';
import createModel from '../../../models/customer.model';

const { SearchCustomer } = require('./search-customer.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('customer-search', new SearchCustomer(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('customer-search');
  service.hooks(hooks);
}
