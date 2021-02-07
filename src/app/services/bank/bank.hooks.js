import { GeneralError } from '@feathersjs/errors';
import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';
import { Op } from 'sequelize';

const setActive = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.where = { is_active: 1 };
};

const setAttributesForGet = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.attributes = [
    'bank_id',
    'bank_name',
  ];
  sequelize.order = [['bank_name', 'ASC']];
  sequelize.nest = true;
  sequelize.raw = true;
};

const joinTableForGet = () => async (context) => {
  const bank_id = _.get(context, 'id');
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    branch
  } = associateModel;
  const branches = await branch.findAll({
    attributes: [
      'branch_id',
      'branch_name'
    ],
    where: { is_active: 1, bank_id: bank_id },
    order: [['create_date', 'ASC']]
  });
  if (!_.isEmpty(branches)) {
    context.result = {
      ...context.result,
      branches: [...branches]
    };
  }
};

const setAttributes = () => (context) => {
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }
  const { sequelize } = context.params;
  sequelize.attributes = [
    'bank_id',
    'bank_name',
    'create_date',
    'update_date',
    'is_active'
  ];
  if (context.params.query.bank_name) {
    sequelize.where = { ...sequelize.where, bank_name: { [Op.like]: `%${context.params.query.bank_name}%` } };
  }
  sequelize.order = [['create_date', 'DESC']];
  sequelize.raw = true;
  sequelize.nest = true;
};

const setAttributesForCreate = () => (context) => {
  const user_id = _.get(context, 'params.info.user_id');
  context.data.create_by = user_id;
};

const saveBranch = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    bank,
    branch
  } = associateModel;
  try {
    const branches = _.get(context, 'data.branches');
    const user_id = context.data.create_by;
    const bank_id = _.get(context, 'result.bank_id');
    if (!branches || _.isEmpty(branches)) {
      return context;
    }
    _.map(branches, (e) => {
      e.bank_id = bank_id;
      e.create_by = user_id;
    });
    const res = await branch.bulkCreate(branches);
    if (res && context.result.data) {
      context.result.data = {
        ...context.result.data,
        branches: [...res]
      };
    }
    return context;
  } catch (e) {
    const bank_id = _.get(context, 'result.bank_id');
    await bank.destroy({
      where: { bank_id: bank_id }
    });
    return context;
  }
};

const patchBranch = () => async (context) => {
  const associateModel = context.app.get('sequelizeClient').models;
  const {
    bank,
    branch
  } = associateModel;
  try {
    const bank_id = _.get(context, 'id');
    const add_branches = _.get(context, 'data.add_branch');
    const edit_branches = _.get(context, 'data.edit_branch');
    const delete_branches = _.get(context, 'data.delete_branch');
    const user_id = _.get(context, 'params.info.user_id');
    if (!_.isEmpty(add_branches)) {
      const add = [];
      add_branches.forEach((e) => {
        add.push({
          branch_name: _.get(e, 'branch_name'),
          bank_id: bank_id,
          create_by: user_id
        });
      });
      await branch.bulkCreate([...add]);
    }
    if (!_.isEmpty(edit_branches)) {
      const edit = [];
      edit_branches.forEach((e) => {
        edit.push({
          branch_id: _.get(e, 'branch_id'),
          branch_name: _.get(e, 'branch_name'),
          bank_id: bank_id,
          create_by: user_id,
          update_by: user_id
        });
      });
      await branch.bulkCreate([...edit], {
        updateOnDuplicate: ['branch_id', 'branch_name', 'bank_id']
      });
    }
    if (!_.isEmpty(delete_branches)) {
      const del = [];
      delete_branches.forEach((e) => {
        del.push(_.get(e, 'branch_id'));
      });
      await branch.update({
        is_active: 0
      }, {
        where: { branch_id: { [Op.in]: [...del] } }
      });
    }
    if (_.get(context, 'data.is_delete')) {
      await branch.update({
        is_active: 0
      }, {
        where: { bank_id: bank_id }
      });
    }
  } catch (e) {
    throw new GeneralError(e);
  }
};

export default {
  before: {
    all: [],
    find: [
      setActive(),
      setAttributes()
    ],
    get: [
      // setActive(),
      setAttributesForGet()
    ],
    create: [
      setAttributesForCreate()
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
    get: [
      joinTableForGet()
    ],
    create: [
      saveBranch()
    ],
    update: [],
    patch: [
      patchBranch()
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
