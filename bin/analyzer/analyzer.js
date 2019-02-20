'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cliProgress = require('cli-progress');

var _cliProgress2 = _interopRequireDefault(_cliProgress);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _table = require('./table');

var _table2 = _interopRequireDefault(_table);

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
        this.tableLogger = new _table2.default();
        this.logs = [];
        this.bar = null;
    }

    analyze() {
        var _this = this;

        return _asyncToGenerator(function* () {
            _this.bar = new _cliProgress2.default.Bar({}, _cliProgress2.default.Presets.shades_classic);
            _this.bar.start();
            const promiseQueues = [];

            for (let i = 0; i < _this.times; i++) {
                promiseQueues.push((yield _this.getTimings(i)));
            }

            yield Promise.all(promiseQueues);

            _this.bar.stop();
            console.log('analyze finished, below is a table based on the number of times and statistical results.');

            yield _this.logger.generate(_this.logs);

            _this.tableLogger.printTable(_this.logs);

            process.exit(0);
        })();
    }

    getTimings(index) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const browser = yield _puppeteer2.default.launch();
            const page = yield browser.newPage();
            const client = yield page.target().createCDPSession();

            yield client.send('Network.emulateNetworkConditions', _this2.network);
            yield page.setCacheEnabled(_this2.cache);

            yield page.goto(_this2.url, {
                timeout: 0
            });

            const performanceTiming = JSON.parse((yield page.evaluate(function () {
                return JSON.stringify(window.performance.timing);
            })));

            _this2.logs.push(_this2.calcTimes(performanceTiming));

            yield browser.close();
            _this2.bar.update(_lodash2.default.multiply(_lodash2.default.divide(_lodash2.default.add(index, 1), _this2.times), 100));
        })();
    }

    calcTimes(timing) {
        const timingObj = {};
        timingObj['DNS lookup time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domainLookupEnd, timing.domainLookupStart), 1000);
        timingObj['Tcp connect time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = _lodash2.default.divide(_lodash2.default.subtract(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domComplete - timing.domLoading), 1000);
        timingObj['Dom parsed time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['Script Loaded time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['onLoad event time'] = _lodash2.default.divide(_lodash2.default.subtract(timing.loadEventEnd - timing.loadEventStart), 1000);

        return timingObj;
    }
}
exports.default = Analyzer;