import { disallow } from 'feathers-hooks-common';
import _ from 'lodash';

const setAttributes = () => (context) => {
  const { view_permission, edit_permission, delete_permission } = context.data;
  context.data.view_permission = JSON.stringify(view_permission);
  context.data.edit_permission = JSON.stringify(edit_permission);
  context.data.delete_permission = JSON.stringify(delete_permission);
};

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setAttributes()
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
