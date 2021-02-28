import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';

const setAttributes = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  const res = await customer.findAll({
    attributes: [
      'customer_id',
      'name'
    ],
    where: { is_active: 1 },
    order: [['name', 'ASC']]
  });
  context.result = res;
};

export default {
  before: {
    all: [],
    find: [
      setAttributes()
    ],
    get: [
      disallow()
    ],
    create: [
      disallow()
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
