#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _fsExtraPromise = require('fs-extra-promise');

var fs = _interopRequireWildcard(_fsExtraPromise);

var _inquirer = require('inquirer');

var inquirer = _interopRequireWildcard(_inquirer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _network = require('./config/network');

var _network2 = _interopRequireDefault(_network);

var _default = require('./config/default');

var _default2 = _interopRequireDefault(_default);

var _analyzer = require('./analyzer/analyzer');

var _analyzer2 = _interopRequireDefault(_analyzer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * 参数处理, 调用性能分析方法
 */

console.log(fs.writeFile('a.log', '爱上的计划把手机好多把设计好的吧'));

const urlPattern = new RegExp('^((ft|htt)ps?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?' + // port
'(\\/[-a-z\\d%@_.~+&:]*)*' + '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');

inquirer.prompt([{
    name: 'url',
    message: 'input your test url',
    type: 'input',
    default: 'https://www.baidu.com',
    validate(url) {
        return urlPattern.test(url) ? true : 'please input a valid url';
    }
}, {
    name: 'network',
    message: 'choose your network throttler',
    choices: _lodash2.default.keys(_network2.default).reverse(),
    type: 'list'
}, {
    name: 'cache',
    message: 'would you disable cache to analyze your website',
    choices: ['Yes', 'No'],
    type: 'list'
}, {
    name: 'times',
    message: 'how many times would you want to analyze your website',
    type: 'input',
    default: '1'
}, {
    name: 'log',
    message: 'would you want to export the log after analysis',
    choices: ['Yes', 'No'],
    type: 'list'
}]).then((() => {
    var _ref = _asyncToGenerator(function* ({ url, network, times, cache, log }) {
        const config = _extends({}, _default2.default, {
            url,
            network: _network2.default[network],
            times: Number(times),
            cache: cache === 'No',
            log: log === 'Yes'
        });

        const analyzer = new _analyzer2.default(config);
        yield analyzer.analyze();
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})());