import { disallow } from 'feathers-hooks-common';

const setAttributes = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    account
  } = associateModel;
  const res = await account.findAll({
    attributes: [
      'account_id',
      'account_no',
      'account_name'
    ],
    where: { is_active: 1, customer_id: context.params.query.customer_id },
    order: [['account_no', 'ASC']]
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
