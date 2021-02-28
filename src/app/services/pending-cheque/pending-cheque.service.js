// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './pending-cheque.hooks';
import createModel from '../../models/cheque.model';

const { PendingCheque } = require('./pending-cheque.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('pending-cheque', new PendingCheque(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('pending-cheque');
  service.hooks(hooks);
}
