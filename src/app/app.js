require('dotenv').config();

// eslint-disable-next-line import/first
import globalAppGet from './middleware/global-app-get';

const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const config = require('config');

const feathers = require('@feathersjs/feathers');

const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const logger = require('../logger');

const middleware = require('./middleware');
const services = require('./services');

const appHooks = require('./app.hooks');

// const authentication = require('./authentication');

const sequelize = require('./sequelize');

const appEngine = express(feathers());

// Load app configuration
appEngine.configure(configuration());
appEngine.configure(globalAppGet());
// Enable security, CORS, compression, favicon and body parsing
appEngine.use(helmet());
appEngine.use(cors());
appEngine.use(compress());
appEngine.use(express.json());
appEngine.use(express.urlencoded({ extended: true }));
// appEngine.use(favicon(path.join(appEngine.get('public'), 'favicon.ico')));
// Host the public folder
// appEngine.use('/', express.static(appEngine.get('public')));

// Set up Plugins and providers
appEngine.configure(express.rest());
appEngine.configure(socketio());

appEngine.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
appEngine.configure(middleware);
// appEngine.configure(authentication);
// Set up our services (see `services/index.js`)
appEngine.configure(services);

// Configure a middleware for 404s and the error handler
appEngine.use(express.notFound());
appEngine.use(express.errorHandler({ logger }));

appEngine.hooks(appHooks);

module.exports = appEngine;
