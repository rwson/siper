#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _enquirer = require('enquirer');

var _ensureDirectory = require('ensure-directory');

var _ensureDirectory2 = _interopRequireDefault(_ensureDirectory);

var _network = require('./config/network');

var _network2 = _interopRequireDefault(_network);

var _default = require('./config/default');

var _default2 = _interopRequireDefault(_default);

var _analyzer = require('./analyzer/analyzer');

var _analyzer2 = _interopRequireDefault(_analyzer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * 参数处理, 调用性能分析方法
 */


const urlPattern = new RegExp('^((ft|htt)ps?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?' + // port
'(\\/[-a-z\\d%@_.~+&:]*)*' + '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');

const init = (() => {
    var _ref = _asyncToGenerator(function* ({ url, network, times, cache, log, coverage, trace }) {
        const config = _extends({}, _default2.default, {
            url,
            network: _network2.default[network],
            times: Number(times),
            cache: cache === 'No',
            log: log === 'Yes',
            coverage: coverage === 'Yes',
            trace: trace === 'Yes'
        });

        yield (0, _ensureDirectory2.default)(config.logDir);

        const analyzer = new _analyzer2.default(config);
        analyzer.analyze();
    });

    return function init(_x) {
        return _ref.apply(this, arguments);
    };
})();

(0, _enquirer.prompt)([{
    name: 'url',
    message: 'input your test url',
    type: 'input',
    default: 'https://www.baidu.com',
    validate(url) {
        return urlPattern.test(url) ? true : 'please input a valid url';
    }
}, {
    name: 'network',
    type: 'select',
    message: 'choose your network throttler',
    scroll: false,
    choices: _lodash2.default.keys(_network2.default).reverse()
}, {
    name: 'cache',
    type: 'select',
    message: 'would you disable cache to analyze your website',
    scroll: false,
    choices: ['Yes', 'No']
}, {
    name: 'times',
    message: 'how many times would you want to analyze your website',
    type: 'input',
    default: '1'
}, {
    name: 'log',
    type: 'select',
    message: 'would you want to export the log after analysis',
    scroll: false,
    choices: ['Yes', 'No']
}, {
    name: 'coverage',
    type: 'select',
    message: 'would you want to view the coverage of your css and js',
    scroll: false,
    choices: ['Yes', 'No']
}, {
    name: 'trace',
    type: 'select',
    message: 'would you want to trace timeline of your website',
    scroll: false,
    choices: ['Yes', 'No']
}]).then(init);