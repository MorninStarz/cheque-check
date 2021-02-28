import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';

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
  sequelize.where = { is_active: 1 };
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  sequelize.nest = true;
  sequelize.include = [
    {
      model: customer,
      attributes: [
        'name'
      ],
      where: { is_active: 1 }
    }
  ];
  const {
    customer_id,
    amount,
    transfer_date_form,
    transfer_date_to
  } = context.params.query;
  if (customer_id) {
    sequelize.include[0].where = { ...sequelize.include[0].where, customer_id: customer_id };
  }
  const transfer_date = dateTimeCondition(transfer_date_form, transfer_date_to);
  if (transfer_date) sequelize.where = { ...sequelize.where, transfer_date: transfer_date };
  if (amount) sequelize.where = { ...sequelize.where, amount: { [Op.like]: `%${amount}%` } };
};

const setCreateBy = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.create_by = user_id;
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.nest = true;
};

const adjustCustomerAmount = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  const findCustomer = await customer.findByPk(context.result.customer_id);
  findCustomer.expect_amount = +findCustomer.expect_amount + (+context.result.amount);
  findCustomer.save();
};

const logTransaction = (type = 'create') => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    transaction
  } = associateModel;
  await transaction.create({
    transfer_id: context.result.transfer_id,
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
      setAttributes()
    ],
    get: [],
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
      disallow()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      adjustCustomerAmount(),
      logTransaction()
    ],
    update: [],
    patch: [
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
