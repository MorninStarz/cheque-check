import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';

const setAttributeForPatch = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    transfer
  } = associateModel;
  const { items } = context.data;
  const transfers = await transfer.findAll({
    attributes: [
      'transfer_id',
      'amount',
      'customer_id',
      'create_by'
    ],
    where: {
      amount: { [Op.in]: items.map((item) => item.amount) },
      customer_id: { [Op.in]: items.map((item) => item.customer_id) },
      transfer_date: { [Op.is]: null }
    },
    nest: true,
    raw: true
  });
  const user_id = _.get(context, 'params.info.user_id');
  const transferWithDate = transfers.map((t) => {
    const itemWithDate = items.find((item) => !Number.isNaN(item.amount)
      && +item.amount === t.amount);
    return {
      transfer_id: t.transfer_id,
      amount: t.amount,
      transfer_date: moment(itemWithDate.transfer_date, 'DD/MM/YYYY HH:mm'),
      customer_id: t.customer_id,
      create_by: t.create_by,
      update_by: user_id
    };
  });
  context.result = await transfer.bulkCreate(transferWithDate, {
    fields: [
      'transfer_id',
      'amount',
      'transfer_date',
      'customer_id',
      'create_by',
      'update_by'
    ],
    updateOnDuplicate: [
      'transfer_id',
      'amount',
      'transfer_date',
      'customer_id',
      'create_by',
      'update_by'
    ]
  });
};

const adjustCustomerAmount = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  context.result.forEach(async (res) => {
    const customer_res = await customer.findByPk(res.customer_id);
    customer_res.actual_amount = +customer_res.actual_amount + (+res.amount);
    customer_res.save();
  });
};

const logTransaction = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    transaction
  } = associateModel;
  context.result.forEach(async (res) => {
    await transaction.create({
      transfer_id: res.transfer_id,
      customer_id: res.customer_id,
      amount: res.amount || '',
      create_by: res.update_by || context.params.info.user_id,
      transaction_type: 'update'
    });
  });
  return context;
};

export default {
  before: {
    all: [],
    find: [
      disallow()
    ],
    get: [
      disallow()
    ],
    create: [
      setAttributeForPatch()
    ],
    update: [
      disallow()
    ],
    patch: [
      disallow()
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
