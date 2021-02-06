import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { cryptPassword } from '../utils/hash';

const encrypt = () => async (context) => {
  const password = _.get(context, 'data.password');
  context.data.password = await cryptPassword(password);
};

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      encrypt()
    ],
    update: [
      disallow()
    ],
    patch: [],
    remove: [
      disallow()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
