import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';

const setActive = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.where = { is_active: 1 };
};

const dateTimeCondition = (from, to) => {
  let dateBtw;
  const format = 'YYYY-MM-DD 00:00:00.000';
  if (from) {
    dateBtw = to ? { [Op.gte]: moment(from).format(format), [Op.lt]: moment(to).add(1, 'day').format(format) }
      : { [Op.gte]: moment(from).format('YYYY-MM-DD 00:00:00.000') };
  } else if (to) {
    dateBtw = { [Op.lt]: moment(to).add(1, 'day').format(format) };
  }
  return dateBtw;
};

const setAttributes = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.attributes = [
    'transfer_id',
    'amount',
    'transfer_date'
  ];
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    account,
    customer,
    bank,
    branch
  } = associateModel;
  sequelize.nest = true;
  sequelize.include = [
    {
      model: account,
      attributes: [
        'account_id',
        'account_no'
      ]
    },
    {
      model: customer,
      attributes: [
        'customer_id',
        'name',
        'lastname'
      ],
      where: { is_active: 1 }
    },
    {
      model: bank,
      attributes: [
        'bank_id',
        'bank_name'
      ],
      where: { is_active: 1 }
    },
    {
      model: branch,
      attributes: [
        'branch_id',
        'branch_name'
      ],
      where: { is_active: 1 }
    }
  ];
  const {
    account_id,
    customer_id,
    bank_id,
    branch_id,
    transfer_date_from,
    transfer_date_to,
    amount
  } = context.params.query;
  if (account_id) {
    sequelize.include[0].where = { ...sequelize.include[0].where, account_id: account_id };
  }
  if (customer_id) {
    sequelize.include[1].where = { ...sequelize.include[0].where, customer_id: customer_id };
  }
  if (bank_id) {
    sequelize.include[2].where = { ...sequelize.include[1].where, bank_id: bank_id };
  }
  if (branch_id) {
    sequelize.include[3].where = { ...sequelize.include[2].where, branch_id: branch_id };
  }
  const transfer_date = dateTimeCondition(transfer_date_from, transfer_date_to);
  if (transfer_date) sequelize.where = { ...sequelize.where, transfer_date: transfer_date };
  if (amount) sequelize.where = { ...sequelize.where, amount: { [Op.like]: `%${amount}%` } };
};

const setCreateBy = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  const req = _.get(context, 'data');
  if (!req.transfer_date) delete context.data.transfer_date;
  if (!req.approve_date) delete context.data.approve_date;
  context.data.create_by = user_id;
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.nest = true;
};

const checkStatus = () => async (context) => {
  const customer_id = _.get(context, 'data.customer_id');
  const amount = _.get(context, 'data.amount');
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  const customerFind = await customer.findByPk(customer_id);
  customerFind.actual_amount = (+customerFind.actual_amount) + (+amount);
  customerFind.save();
  return context;
};

const logTransaction = (type = 'create') => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    transaction
  } = associateModel;
  await transaction.create({
    transfer_id: context.result.transfer_id,
    account_id: context.result.account_id,
    customer_id: context.result.customer_id,
    amount: context.result.amount || '',
    create_by: context.result.create_by || context.params.info.user_id,
    transaction_type: type
  });
  return context;
};

export default {
  before: {
    all: [],
    find: [
      setActive(),
      setAttributes()
    ],
    get: [
      setActive()
    ],
    create: [
      setCreateBy()
    ],
    update: [
      disallow()
    ],
    patch: [
      setCreateBy()
    ],
    remove: [
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      checkStatus(),
      logTransaction()
    ],
    update: [],
    patch: [
      checkStatus(),
      logTransaction('update')
    ],
    remove: [
      logTransaction('delete')
    ]
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
