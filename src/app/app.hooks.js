import _ from 'lodash';
import { NotAuthenticated } from '@feathersjs/errors';
import jwt from 'jsonwebtoken';
import {
  logService
} from './hooks';

const checkJwt = () => (context) => {
  if (context.path === 'authenticate') return context;
  const {
    authorization: originalToken
  } = _.get(context, 'params.headers') || false;
  // check prefix forces to Bearer
  if (!originalToken) {
    throw new NotAuthenticated('required access token');
  }
  if (!originalToken.startsWith('Bearer ')) {
    throw new NotAuthenticated('required prefix Bearer');
  }
  const tokenFinal = originalToken.substring(7, originalToken.length);
  if (!tokenFinal) throw new NotAuthenticated('require accessToken');
  const secret = _.get(context.app.get('user'), 'authentication.secret');
  try {
    const decoded = jwt.verify(tokenFinal, secret);
    context.params.info = decoded;
    context.params.tokenFinal = tokenFinal;
  } catch (error) {
    throw new NotAuthenticated(error.message);
  }
  return context;
};

const checkDuplicate = () => async (context) => {
  if (context.path === 'authenticate') return context;
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    login_transaction
  } = associateModel;
  const user_id = _.get(context.params.info, 'user_id');
  const res = await login_transaction.findOne({
    attributes: [
      'token'
    ],
    where: { user_id: user_id }
  });
  if (!res) throw new NotAuthenticated('User is not logged in');
  else if (res.token !== context.params.tokenFinal) throw new NotAuthenticated('Token not match');
  return context;
};

module.exports = {
  before: {
    all: [
      logService(),
      checkJwt(),
      checkDuplicate()
    ],
    find: [
    ],
    get: [
    ],
    create: [
    ],
    update: [
    ],
    patch: [
    ],
    remove: [
    ]
  },

  after: {
    all: [
      logService()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      logService()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
