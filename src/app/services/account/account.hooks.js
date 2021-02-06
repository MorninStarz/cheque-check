import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { Op } from 'sequelize';

const setAttribute = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  if (!sequelize) context.params.sequelize = {};
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer,
    bank,
    branch
  } = associateModel;
  sequelize.attributes = [
    'account_id',
    'account_no',
    'account_name',
    'is_active'
  ];
  sequelize.where = {};
  if (context.params.query.account_no) {
    sequelize.where = { account_no: { [Op.like]: `%${context.params.query.account_no}%` } };
  }
  if (context.params.query.account_name) {
    sequelize.where = {
      ...sequelize.where,
      [Op.like]: { account_name: context.params.query.account_name }
    };
  }
  sequelize.include = [
    {
      model: customer,
      attributes: [
        'name',
        'lastname'
      ],
      where: context.params.query.customer_id
        ? { customer_id: context.params.query.customer_id } : {}
    },
    {
      model: bank,
      attributes: [
        'bank_id',
        'bank_name'
      ],
      where: context.params.query.bank_id ? { bank_id: context.params.query.bank_id } : {}
    },
    {
      model: branch,
      attributes: [
        'branch_id',
        'branch_name'
      ],
      where: context.params.query.branch_id ? { branch_id: context.params.query.branch_id } : {}
    }
  ];
  delete context.params.query;
  sequelize.nest = true;
  sequelize.order = [['account_no', 'ASC']];
};

export default {
  before: {
    all: [],
    find: [
      setAttribute()
    ],
    get: [],
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
