import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

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
  context.accounts = context.data.accounts;
  delete context.data.accounts;
};

const setAttributesForUpdate = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.update_by = user_id;
  context.accounts = context.data.accounts;
  delete context.data.accounts;
};

const createAccount = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    account
  } = associateModel;
  const user_id = _.get(context, 'params.info.user_id');
  const { customer_id } = context.result;
  const req = [];
  context.accounts.forEach((e) => {
    req.push({
      account_no: e.account_no,
      customer_id: customer_id,
      account_name: e.account_name,
      bank_id: e.bank_id,
      branch_id: e.branch_id,
      create_by: user_id
    });
  });
  await account.bulkCreate([...req]);
};

const updateAccount = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    account
  } = associateModel;
  const user_id = _.get(context, 'params.info.user_id');
  const { customer_id } = context.result;
  const req = [];
  const res = await account.findAll({
    attributes: ['account_id'],
    where: { customer_id: customer_id }
  });
  context.accounts.forEach((e, i) => {
    req.push({
      account_id: e.account_id || uuidv4(),
      account_no: e.account_no,
      customer_id: customer_id,
      account_name: e.account_name,
      bank_id: e.bank_id,
      branch_id: e.branch_id,
      create_by: user_id,
      update_by: user_id
    });
  });
  await account.bulkCreate([...req], {
    updateOnDuplicate: ['account_no', 'customer_id', 'account_name', 'bank_id', 'branch_id', 'update_by']
  });
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
    create: [
      createAccount()
    ],
    update: [],
    patch: [
      updateAccount()
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
