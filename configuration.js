/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

const fs = require('fs');
const validateIP = require('validate-ip-node');
const logger = require('./logger');

let configuration = {};

load();

module.exports.getConfiguration = () => {
  if (Object.keys(configuration).length === 0 && configuration.constructor === Object) {
    load();
  }

  return configuration;
};

module.exports.setLanguageVersions = (versions) => {
  configuration.languages.versions = versions;
};

function load() {
  try {
    configuration = JSON.parse(fs.readFileSync(`${__dirname}/config/config.json`, 'utf8').replace(/^\uFEFF/, ''));
  } catch (err) {
    logger.error('Error while loading configuration files, treating everything as default');
  }

  treatDefaultValues();
}

function treatDefaultValues() {
  if (!validateIP(configuration.DispatcherAddress)) {
    logger.warn('Master IP Address is invalid or undefined. Default: undefined');
    configuration.DispatcherAddress = undefined;
  }

  if (configuration.languages === undefined) {
    logger.warn('Supported languages are not defined. Default: Allow all working languages');
    configuration.languages = {
      list: [],
      map: {},
      allow_others: true
    };
    configuration.languages.allow_others = true;
  } else {
    // if allow_others is undefined or not boolean
    if (configuration.languages.allow_others === undefined
      || typeof (configuration.languages.allow_others) !== 'boolean') {
      logger.warn('Permission to run other languages is undefined or not a boolean. Default: true');
      configuration.languages.allow_others = true;
    }
    // if list is undefined, it is empty
    if (configuration.languages.list === undefined) {
      logger.warn('List of supported languages is undefined. Default: []');
      configuration.languages.list = [];
      configuration.languages.map = {};
    } else {
      configuration.languages.list = validateLanguages(configuration.languages.list);
      configuration.languages.map = {};
    }
  }
}

function validateLanguages(languages) {
  // if it is not array, treat as invalid
  if (!Array.isArray(languages)) {
    logger.warn('Defined list of supported languages is not an array. Default: []');
    return [];
  }

  const newList = [];
  const { length } = languages.length;
  for (let i = 0; i < length; i += 1) {
    if (typeof languages[i] === 'string') {
      newList.push(languages[i]);
    } else {
      logger.warn(`Element '${languages[i]}' (index ${i}) from the supported languages is not a string. Currently being ignored`);
    }
  }

  return newList;
}
