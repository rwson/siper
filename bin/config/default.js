'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _dayjs = require('dayjs');

var _dayjs2 = _interopRequireDefault(_dayjs);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 配置文件
 */

const LOG_DIR = (0, _path.resolve)(process.cwd(), 'siper-logs');

const defaultConfig = {
    network: 'DSL',
    log: true,
    trace: true,
    logDir: LOG_DIR,
    logPath: (0, _path.resolve)(LOG_DIR, `siper-times-${(0, _dayjs2.default)().format('YYYY-MM-DD-HH-mm-ss')}.log`),
    tracePath: (0, _path.resolve)(LOG_DIR, `siper-trace-${(0, _dayjs2.default)().format('YYYY-MM-DD-HH-mm-ss')}.json`)
};

exports.default = defaultConfig;