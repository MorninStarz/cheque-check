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

const setAttributes = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    cheque,
    customer,
    bank,
    branch
  } = associateModel;
  const where = [];
  where.push({ is_active: 1, status: 'Approved' });
  where.push({ is_active: 1 });
  where.push({ is_active: 1 });
  where.push({ is_active: 1 });
  const {
    cheque_no,
    customer_id,
    bank_id,
    branch_id,
    pending_date_from,
    pending_date_to,
    approve_date_from,
    approve_date_to,
    amount
  } = context.params.query;
  if (cheque_no) where[0] = { ...where[0], cheque_no: { [Op.like]: `%${cheque_no}%` } };
  if (customer_id) {
    where[1] = { ...where[1], customer_id: customer_id };
  }
  if (bank_id) {
    where[2] = { ...where[2], bank_id: bank_id };
  }
  if (branch_id) {
    where[3] = { ...where[3], branch_id: branch_id };
  }
  const pending_date = dateTimeCondition(pending_date_from, pending_date_to);
  if (pending_date) where[0] = { ...where[0], pending_date: pending_date };
  const approve_date = dateTimeCondition(approve_date_from, approve_date_to);
  if (approve_date) where[0] = { ...where[0], approve_date: approve_date };
  if (amount) where[0] = { ...where[0], amount: { [Op.like]: `%${amount}%` } };
  context.result = await cheque.findAll({
    attributes: [
      'cheque_id',
      'cheque_no',
      'month',
      'amount',
      'pending_date',
      'approve_date',
      'remark'
    ],
    where: where[0],
    nest: true,
    include: [
      {
        model: customer,
        attributes: [
          'name'
        ],
        where: where[1]
      },
      {
        model: bank,
        attributes: [
          'bank_name'
        ],
        where: where[2]
      },
      {
        model: branch,
        attributes: [
          'branch_name'
        ],
        where: where[3]
      }
    ]
  });
};

const setAttributeForPatch = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    cheque
  } = associateModel;
  const findCheque = await cheque.findByPk(context.id);
  const user_id = _.get(context, 'params.info.user_id');
  const req = _.get(context, 'data');
  if (req.is_pass) {
    findCheque.status = 'Pass';
    findCheque.pass_date = req.pass_date;
  } else {
    findCheque.status = 'Pending';
    findCheque.remark = req.remark;
  }
  findCheque.create_by = user_id;
  context.result = await findCheque.save();
};

const adjustCustomerAmount = () => async (context) => {
  if (context.result.status !== 'Pass') return;
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer
  } = associateModel;
  const findCustomer = await customer.findByPk(context.result.customer_id);
  findCustomer.actual_amount = +findCustomer.actual_amount + (+context.result.amount);
  findCustomer.save();
};

const logTransaction = () => async (context) => {
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
    transaction_type: 'update'
  });
  return context;
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
    patch: [
      setAttributeForPatch()
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
    patch: [
      adjustCustomerAmount(),
      logTransaction()
    ],
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
