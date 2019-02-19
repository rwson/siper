'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _dayjs = require('dayjs');

var _dayjs2 = _interopRequireDefault(_dayjs);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultConfig = {
    network: 'DSL',
    log: true,
    logPath: (0, _path.resolve)(process.cwd(), `siper-${(0, _dayjs2.default)().format('YYYY-MM-DD HH:mm:ss')}.log`)
};

exports.default = defaultConfig;