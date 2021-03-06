import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';

const setActive = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.where = { is_active: 1 };
};

const setAttributesForCreate = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.create_by = user_id;
};

export default {
  before: {
    all: [],
    find: [
      setActive()
    ],
    get: [
      setActive()
    ],
    create: [
      setAttributesForCreate()
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
