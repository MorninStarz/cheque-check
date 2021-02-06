import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';

const setAttributes = () => (context) => {
  const ip = _.get(context, 'params.ip');
  context.data.ip = ip;
};

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setAttributes()
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
