import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';

const setAttributesForGet = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.attributes = [
    'customer_id',
    'name',
    'expect_amount',
    'actual_amount',
  ];
  sequelize.nest = true;
  sequelize.where = { is_active: 1 };
};

const setAttributesForCreate = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.create_by = user_id;
};

const setAttributesForUpdate = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.update_by = user_id;
};

export default {
  before: {
    all: [],
    find: [],
    get: [
      setAttributesForGet()
    ],
    create: [
      setAttributesForCreate()
    ],
    update: [
      disallow()
    ],
    patch: [
      setAttributesForUpdate()
    ],
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
