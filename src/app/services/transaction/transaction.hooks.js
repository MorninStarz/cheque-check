import { GeneralError } from '@feathersjs/errors';
import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { Op } from 'sequelize';
import moment from 'moment';

const setAttribute = () => (context) => {
  const {
    customer_id,
    pending_date_form,
    pending_date_to
  } = _.get(context, 'params.query');
  try {
    if (!context.params.sequelize) {
      context.params.sequelize = {};
    }
    const { sequelize } = context.params;
    sequelize.attributes = [
      'cheque_id',
      'transfer_id',
      'amount'
    ];
    sequelize.nest = true;
    sequelize.raw = true;
    sequelize.where = { is_active: 1 };
    const associateModel = context.app.get('sequelizeClient').models;
    const {
      customer
    } = associateModel;
    sequelize.include = [
      {
        model: customer,
        attributes: [
          'name'
        ],
        where: { is_active: 1 }
      }
    ];
    if (customer_id) {
      sequelize.include[0].where = { ...sequelize.include[0].where, customer_id: customer_id };
      delete context.params.query.customer_id;
    }
    if (pending_date_form) {
      context.pending_date_form = pending_date_form;
      delete context.params.query.pending_date_form;
    }
    if (pending_date_to) {
      context.pending_date_to = pending_date_to;
      delete context.params.query.pending_date_to;
    }
  } catch (error) {
    throw new GeneralError(error);
  }
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

const joinTableForFind = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    cheque,
    transfer
  } = associateModel;
  try {
    await Promise.all(context.result.data.map(async (e) => {
      if (e.cheque_id) {
        let where = {};
        const pending_date = dateTimeCondition(context.pending_date_from, context.pending_date_to);
        if (pending_date) where = { where, pending_date: pending_date };
        e.cheque = await cheque.findByPk(e.cheque_id, {
          attributes: [
            'cheque_no',
            'pending_date'
          ],
          where: where,
          raw: true,
          nest: true
        });
      } else {
        let where = {};
        const transfer_date = dateTimeCondition(context.pending_date_from, context.pending_date_to);
        if (transfer_date) where = { where, transfer_date: transfer_date };
        e.transfer = await transfer.findByPk(e.transfer_id, {
          attributes: [
            'transfer_date'
          ],
          where: where,
          raw: true,
          nest: true
        });
      }
    }));
    return context;
  } catch (error) {
    throw new GeneralError(error);
  }
};

export default {

  before: {
    all: [],
    find: [
      setAttribute()
    ],
    get: [],
    create: [],
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
      joinTableForFind()
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
