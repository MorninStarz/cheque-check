// Initializes the `users` service on path `/users`
import config from 'config';
import hooks from './cheque.hooks';
import createModel from '../../models/cheque.model';

const { Cheque } = require('./cheque.class');

export default function (app) {
  const options = {
    Model: createModel(app),
    paginate: config.get('user.paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('cheque', new Cheque(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('cheque');
  service.hooks(hooks);
}
