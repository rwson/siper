'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Analyzer {

    constructor(options) {
        this.url = options.url;
        this.times = options.times;
        this.cache = options.cache;
        this.times = options.times;
        this.network = options.network;
        this.logger = new _logger2.default({
            log: options.log,
            logPath: options.logPath
        });
        this.logs = [];
    }

    analyze() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const browser = yield _puppeteer2.default.launch();
            const page = yield browser.newPage();
            const client = yield page.target().createCDPSession();

            yield client.send('Network.emulateNetworkConditions', _this.network);
            yield page.goto(_this.url);

            const timingObj = {};

            const performanceTiming = JSON.parse((yield page.evaluate(function () {
                return JSON.stringify(window.performance.timing);
            })));

            // timingObj['重定向时间'] = (performanceTiming.redirectEnd - performanceTiming.redirectStart) / 1000;
            // timingObj['DNS解析时间'] = (performanceTiming.domainLookupEnd - performanceTiming.domainLookupStart) / 1000;
            // timingObj['TCP完成握手时间'] = (performanceTiming.connectEnd - performanceTiming.connectStart) / 1000;

            // timingObj['HTTP请求响应完成时间'] = (performanceTiming.responseEnd - performanceTiming.requestStart) / 1000;

            // timingObj['DOM开始加载前所花费时间'] = (performanceTiming.responseEnd - performanceTiming.navigationStart) / 1000;

            // timingObj['DOM加载完成时间'] = (performanceTiming.domComplete - performanceTiming.domLoading) / 1000;

            // timingObj['DOM结构解析完成时间'] = (performanceTiming.domInteractive - performanceTiming.domLoading) / 1000;

            // timingObj['脚本加载时间'] = (performanceTiming.domContentLoadedEventEnd - performanceTiming.domContentLoadedEventStart) / 1000;
            // timingObj['onload事件时间'] = (performanceTiming.loadEventEnd - performanceTiming.loadEventStart) / 1000;
            // timingObj['页面完全加载时间'] = (timingObj['重定向时间'] + timingObj['DNS解析时间'] + timingObj['TCP完成握手时间'] + timingObj['HTTP请求响应完成时间'] + timingObj['DOM结构解析完成时间'] + timingObj['DOM加载完成时间']);

            console.log(performanceTiming);

            yield browser.close();
        })();
    }

    calcTimes(timing) {
        timing = JSON.parse(timing);
        const timingObj = {};
        timingObj['DNS lookup time'] = _lodash2.default.divide(_lodash2.default.subtract((timing.domainLookupEnd, timing.domainLookupStart)), 1000);
        timingObj['Tcp connect time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished Time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = _lodash2.default.divide(_lodash2.default.subtract(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domComplete - timing.domLoading), 1000);
        timingObj['Dom parsed time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['Script Loaded time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domInteractive - timing.domLoading), 1000);

        return timingObj;
    }
}
exports.default = Analyzer;