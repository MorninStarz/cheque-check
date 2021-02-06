import { disallow } from 'feathers-hooks-common';
import { GeneralError } from '@feathersjs/errors';
import _ from 'lodash';
import { Op } from 'sequelize';
import moment from 'moment';

const joinTableForFind = () => async (context) => {
  const {
    name,
    lastname,
    mobile,
    account_no,
    start_date,
    end_date
  } = _.get(context, 'params.query');
  try {
    if (!context.params.sequelize) {
      context.params.sequelize = {};
    }
    const { sequelize } = context.params;
    sequelize.attributes = [
      'customer_id',
      'name',
      'lastname',
      'mobile',
      'account_no',
      'expect_amount',
      'actual_amount',
      'due_date',
      'create_date',
      'create_by',
      'update_date',
      'update_by'
    ];
    sequelize.raw = false;
    sequelize.nest = true;
    sequelize.where = { is_active: 1 };
    if (start_date) {
      const st = moment(start_date);
      let dateBtw;
      if (end_date) {
        const en = moment(end_date);
        if (st.isAfter(en)) throw new GeneralError('Invalid date !');
        dateBtw = { [Op.gte]: moment(st, 'YYYY-MM-DD 00:00:00'), [Op.lt]: moment(en, 'YYYY-MM-DD 00:00:00').add(1, 'day') };
        delete context.params.query.start_date;
        delete context.params.query.end_date;
      } else {
        dateBtw = { [Op.gte]: moment(start_date, 'YYYY-MM-DD 00:00:00') };
        delete context.params.query.start_date;
      }
      sequelize.where = { ...sequelize.where, due_date: dateBtw };
    } else if (end_date) {
      sequelize.where = { ...sequelize.where, due_date: { [Op.lt]: moment(end_date, 'YYYY-MM-DD').add(1, 'day') } };
      delete context.params.query.end_date;
    }
    if (name) {
      sequelize.where = {
        ...sequelize.where,
        name: { [Op.like]: `%${name}%` }
      };
      delete context.params.query.name;
    }
    if (lastname) {
      sequelize.where = {
        ...sequelize.where,
        lastname: { [Op.like]: `%${lastname}%` }
      };
      delete context.params.query.lastname;
    }
    if (mobile) {
      sequelize.where = {
        ...sequelize.where,
        mobile: { [Op.like]: `%${mobile}%` }
      };
      delete context.params.query.mobile;
    }
    if (account_no) {
      sequelize.where = {
        ...sequelize.where,
        account_no: { [Op.like]: `%${account_no}%` }
      };
      delete context.params.query.account_no;
    }
    sequelize.order = [['due_date', 'DESC']];
    return context;
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
