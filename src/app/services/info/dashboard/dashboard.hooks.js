import { disallow } from 'feathers-hooks-common';
import { Op, Sequelize } from 'sequelize';
import moment from 'moment';

const setAttributes = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    customer,
    transaction,
  } = associateModel;
  const counting = await customer.findAll({
    attributes: [
      [Sequelize.fn('sum', Sequelize.col('expect_amount')), 'expected'],
      [Sequelize.fn('sum', Sequelize.col('actual_amount')), 'actual'],
      [Sequelize.fn('max', Sequelize.col('expect_amount')), 'max'],
      [Sequelize.fn('min', Sequelize.col('expect_amount')), 'min'],
    ]
  });
  const passDueDateList = await customer.findAll({
    attributes: [
      'customer_id',
      'name',
      'lastname',
      'due_date',
      'expect_amount',
      'actual_amount'
    ],
    where: { is_active: 1, due_date: { [Op.lt]: moment() } }
  });
  context.result = {
    count: [...counting],
    due: [...passDueDateList]
  };
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
    patch: [],
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
