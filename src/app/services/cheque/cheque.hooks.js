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
    'cheque_id',
    'cheque_no',
    'month',
    'amount',
    'remark',
    'pending_date',
    'approve_date',
    'create_date',
    'update_date',
    'create_by',
    'status'
  ];
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer,
    bank,
    branch
  } = associateModel;
  sequelize.nest = true;
  sequelize.include = [
    {
      model: customer,
      attributes: [
        'name',
        'lastname'
      ],
      where: { is_active: 1 }
    },
    {
      model: bank,
      attributes: [
        'bank_name'
      ],
      where: { is_active: 1 }
    },
    {
      model: branch,
      attributes: [
        'branch_name'
      ],
      where: { is_active: 1 }
    }
  ];
  const {
    cheque_no,
    customer_id,
    bank_id,
    branch_id,
    pending_date_from,
    pending_date_to,
    approve_date_from,
    approve_date_to,
    amount,
    status
  } = context.params.query;
  if (cheque_no) sequelize.where = { ...sequelize.where, cheque_no: { [Op.like]: `%${cheque_no}%` } };
  if (customer_id) {
    sequelize.include[0].where = { ...sequelize.include[0].where, customer_id: customer_id };
  }
  if (bank_id) {
    sequelize.include[1].where = { ...sequelize.include[1].where, bank_id: bank_id };
  }
  if (branch_id) {
    sequelize.include[2].where = { ...sequelize.include[2].where, branch_id: branch_id };
  }
  const pending_date = dateTimeCondition(pending_date_from, pending_date_to);
  if (pending_date) sequelize.where = { ...sequelize.where, pending_date: pending_date };
  const approve_date = dateTimeCondition(approve_date_from, approve_date_to);
  if (approve_date) sequelize.where = { ...sequelize.where, approve_date: approve_date };
  if (amount) sequelize.where = { ...sequelize.where, amount: { [Op.like]: `%${amount}%` } };
  if (status) sequelize.where = { ...sequelize.where, status: status };
};

const setCreateBy = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  const req = _.get(context, 'data');
  if (!req.month) delete context.data.month;
  if (!req.pending_date) delete context.data.pending_date;
  if (!req.approve_date) delete context.data.approve_date;
  context.data.create_by = user_id;
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.nest = true;
};

const checkStatus = () => async (context) => {
  const status = _.get(context, 'data.status');
  if (!status) return context;
  if (status === 'Approved') {
    const customer_id = _.get(context, 'data.customer_id');
    const amount = _.get(context, 'data.amount');
    const associateModel = context.app.get('sequelizeClient').models;
    const {
      customer
    } = associateModel;
    const customerFind = await customer.findByPk(customer_id);
    if (!_.isEmpty(customerFind)) {
      const currentActual = _.get(customerFind, 'actual_amount');
      await customer.update({
        actual_amount: (+currentActual) + (+amount)
      }, {
        where: { customer_id: customer_id }
      });
    }
  }
  return context;
};

const logTransaction = (type = 'create') => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    transaction
  } = associateModel;
  await transaction.create({
    cheque_id: context.result.cheque_id,
    cheque_no: context.result.cheque_no,
    customer_id: context.result.customer_id,
    remark: context.result.remark || '',
    amount: context.result.amount || '',
    cheque_status: context.result.status || '',
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
