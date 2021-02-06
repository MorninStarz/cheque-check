// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './transfer.hooks';
import createModel from '../../models/transfer.model';

const { Transfer } = require('./transfer.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('transfer', new Transfer(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transfer');
  service.hooks(hooks);
}
