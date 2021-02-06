import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { GeneralError } from '@feathersjs/errors';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../../utils/hash';

const auth = () => async (context) => {
  const {
    username,
    password: plainPassword
  } = _.get(context, 'data');
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    user,
    permission
  } = associateModel;
  await user.associate(associateModel);
  const userRes = await user.findOne({
    attributes: [
      'user_id',
      'username',
      'password',
      'permission_id'
    ],
    where: { username: username },
    include: [
      {
        model: permission,
        attributes: [
          'permission_id',
          'permission_name',
          'view_permission',
          'edit_permission',
          'delete_permission'
        ]
      }
    ]
  });
  if (_.isEmpty(userRes)) throw new GeneralError('Invalid username and password');
  const hashPassword = _.get(userRes, 'password');
  if (await !comparePassword(plainPassword, hashPassword)) throw new GeneralError('Invalid username and password');
  context.userInfo = {
    user_id: _.get(userRes, 'user_id'),
    username: _.get(userRes, 'username'),
    permission: {
      permission_id: _.get(userRes, 'permission.permission_id'),
      permission_name: _.get(userRes, 'permission.permission_name'),
      view_permission: JSON.parse(_.get(userRes, 'permission.view_permission')),
      edit_permission: JSON.parse(_.get(userRes, 'permission.edit_permission')),
      delete_permission: JSON.parse(_.get(userRes, 'permission.delete_permission')),
    }
  };
  return context;
};

const generateJwt = () => async (context) => {
  const user_id = _.get(context, 'userInfo.user_id');
  const configAuth = context.app.get('user');
  const expiresIn = _.get(configAuth, 'authentication.expiresIn');
  const secret = _.get(configAuth, 'authentication.secret');
  const token = await jwt.sign({ user_id }, secret, {
    expiresIn: expiresIn,
  });
  context.userInfo = { ...context.userInfo, token: token };
  return context;
};

const saveTransactionLog = () => async (context) => {
  const user_id = _.get(context, 'userInfo.user_id');
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    login_transaction
  } = associateModel;
  const res = await login_transaction.findOne({
    attributes: [
      'transaction_id',
      'user_id',
      'token'
    ],
    where: { user_id: user_id }
  });
  if (_.isEmpty(res)) {
    await login_transaction.create({
      user_id: user_id,
      ip: _.get(context, 'headers.ip') || '::1',
      token: _.get(context, 'userInfo.token'),
      create_date: moment(),
      create_by: 'System'
    });
  } else {
    const transaction_id = _.get(res, 'transaction_id');
    await login_transaction.update({
      user_id: user_id,
      ip: _.get(context, 'headers.ip') || '::1',
      token: _.get(context, 'userInfo.token'),
      create_date: moment(),
      create_by: 'System'
    }, {
      where: { transaction_id: transaction_id }
    });
  }
  context.result = context.userInfo;
};

const setToken = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    login_transaction
  } = associateModel;
  const res = await login_transaction.findOne({
    attributes: ['transaction_id', 'token'],
    where: { user_id: context.data.user_id }
  });
  res.token = '';
  await res.save();
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
      auth(),
      generateJwt(),
      saveTransactionLog()
    ],
    update: [
      disallow()
    ],
    patch: [
      setToken()
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
