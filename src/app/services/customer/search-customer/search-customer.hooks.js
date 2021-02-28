/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { disallow } from 'feathers-hooks-common';
import { GeneralError } from '@feathersjs/errors';
import _ from 'lodash';
import { Op } from 'sequelize';

const joinTableForFind = () => async (context) => {
  const {
    name,
    customer_id
  } = _.get(context, 'params.query');
  try {
    if (!context.params.sequelize) {
      context.params.sequelize = {};
    }
    const { sequelize } = context.params;
    sequelize.attributes = [
      'customer_id',
      'name',
      'expect_amount',
      'actual_amount',
      'create_by',
      'update_by'
    ];
    sequelize.nest = true;
    sequelize.where = { is_active: 1 };
    if (customer_id) {
      sequelize.where = {
        ...sequelize.where,
        customer_id: customer_id
      };
      delete context.params.query.customer_id;
    }
    if (name) {
      sequelize.where = {
        ...sequelize.where,
        name: { [Op.like]: `%${name}%` }
      };
      delete context.params.query.name;
    }
    sequelize.order = [['name', 'DESC']];
    return context;
  } catch (error) {
    throw new GeneralError(error);
  }
};

const setResult = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    user
  } = associateModel;
  try {
    const res = [];
    for (const e of context.result.data) {
      const user_create = await user.findByPk(e.create_by, {
        attributes: [
          'username'
        ],
      });
      let user_update;
      if (e.update_by) {
        user_update = await user.findByPk(e.update_by, {
          attributes: [
            'username'
          ]
        });
      }
      res.push({
        customer_id: e.customer_id,
        name: e.name,
        expect_amount: e.expect_amount,
        actual_amount: e.actual_amount,
        create_by: user_create.username,
        update_by: user_update ? user_update.username : ''
      });
    }
    context.result.data = res;
  } catch (error) {
    throw new GeneralError(error);
  }
};

export default {
  before: {
    all: [],
    find: [
      joinTableForFind()
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
      disallow()
    ],
    remove: [
      disallow()
    ]
  },

  after: {
    all: [],
    find: [
      setResult()
    ],
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
