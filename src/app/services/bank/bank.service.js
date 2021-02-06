// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './bank.hooks';
import createModel from '../../models/bank.model';

const { Bank } = require('./bank.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('bank', new Bank(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('bank');
  service.hooks(hooks);
}
