'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _lodash = require('lodash');

var _cliProgress = require('cli-progress');

var _cliProgress2 = _interopRequireDefault(_cliProgress);

var _prettyBytes = require('pretty-bytes');

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

var _path = require('path');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _table = require('./table');

var _table2 = _interopRequireDefault(_table);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const INNER_STYLE_TAG = 'inner style tag';
const LINK_STYLE_TAG = 'link style tag';
const SRC_SCRIPT_TAG = 'src script tag';
const INNER_SCRIPT_TAG = 'inner script tag';

const JS_REG = /.js$/;
const CSS_REG = /.css$/;

class Analyzer {

    constructor(options) {
        this.url = options.url;
        this.times = options.times;
        this.cache = options.cache;
        this.times = options.times;
        this.network = options.network;
        this.coverage = options.coverage;
        this.trace = options.trace;
        this.tracePath = options.tracePath;

        this.logs = [];
        this.cssCoverages = [];
        this.jsCoverages = [];

        this.bar = null;

        this.logger = new _logger2.default({
            log: options.log,
            logPath: options.logPath
        });
        this.tableLogger = new _table2.default();
    }

    /**
     * 性能分析入口方法
     * @return {Promise<void>}
     */
    analyze() {
        var _this = this;

        return _asyncToGenerator(function* () {
            _this.bar = new _cliProgress2.default.Bar({}, _cliProgress2.default.Presets.shades_classic);

            console.log('analyze started, please wait a moment ...');

            const promiseQueues = [];

            _this.bar.start();

            for (let i = 0; i < _this.times; i++) {
                promiseQueues.push((yield _this.getTimings(i)));
            }

            yield Promise.all(promiseQueues);

            _this.bar.stop();

            if (_this.coverage) {
                yield _this.calcCoverages();
            }

            console.log('start generate log ...');

            if (_this.trace) {
                yield _this.traceTimeline();
            }

            if (_this.coverage) {
                yield _this.logger.generate(_this.logs, _this.cssCoverages, _this.jsCoverages);
            } else {
                yield _this.logger.generate(_this.logs);
            }

            console.log('analyze finished, below is a table based on the number of times and statistical results.');

            _this.tableLogger.printTable(_this.logs);

            process.exit(0);
        })();
    }

    /**
     * 获取当前次数的加载时间
     * @param index Number  当前第几次
     * @return {Promise<void>}
     */
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
            _this2.bar.update((0, _lodash.multiply)((0, _lodash.divide)((0, _lodash.add)(index, 1), _this2.times), 100));
        })();
    }

    /**
     * 计算CSS/js覆盖率
     * @return {Promise<void>}
     */
    calcCoverages() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const browser = yield _puppeteer2.default.launch();
            const page = yield browser.newPage();

            yield Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()]);
            yield page.goto(_this3.url);
            const [jsCoverage, cssCoverage] = yield Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()]);

            yield browser.close();

            let totalBytes = 0;
            let usedBytes = 0;
            let fileName = '';
            let isInner = false;

            _this3.jsCoverages = [...jsCoverage].map(function (coverage) {
                totalBytes = coverage.text.length;
                usedBytes = 0;

                fileName = (0, _path.basename)(coverage.url);

                for (const range of coverage.ranges) {
                    usedBytes += range.end - range.start - 1;
                }

                isInner = JS_REG.test(fileName);

                return {
                    type: !isInner ? INNER_SCRIPT_TAG : SRC_SCRIPT_TAG,
                    name: !isInner ? 'no name' : fileName,
                    totalBytes: (0, _prettyBytes2.default)(totalBytes),
                    usedBytes: (0, _prettyBytes2.default)(usedBytes),
                    coverage: `${(0, _lodash.multiply)((0, _lodash.divide)(usedBytes, totalBytes), 100)}%`
                };
            });

            _this3.cssCoverages = [...cssCoverage].map(function (coverage) {
                totalBytes = coverage.text.length;
                usedBytes = 0;

                fileName = (0, _path.basename)(coverage.url);

                for (const range of coverage.ranges) {
                    usedBytes += range.end - range.start - 1;
                }

                isInner = CSS_REG.test(fileName);

                return {
                    type: !isInner ? INNER_STYLE_TAG : LINK_STYLE_TAG,
                    name: !isInner ? 'no name' : fileName,
                    totalBytes: (0, _prettyBytes2.default)(totalBytes),
                    usedBytes: (0, _prettyBytes2.default)(usedBytes),
                    coverage: `${(0, _lodash.multiply)((0, _lodash.divide)(usedBytes, totalBytes), 100)}%`
                };
            });
        })();
    }

    /**
     * 跟踪timeline
     * @return {Promise<void>}
     */
    traceTimeline() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const browser = yield _puppeteer2.default.launch();
            const page = yield browser.newPage();
            yield page.tracing.start({
                path: _this4.tracePath,
                screenshots: true
            });
            yield page.goto(_this4.url);
            yield page.tracing.stop();
            yield browser.close();

            console.log(`your trace log was saved to ${_this4.tracePath}.`);
        })();
    }

    /**
     * 计算时间
     * @param  timing    Object
     * @return Object
     */
    calcTimes(timing) {
        const timingObj = {};

        timingObj['DNS lookup time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.domainLookupEnd, timing.domainLookupStart), 1000);
        timingObj['Tcp connect time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.domComplete, timing.domLoading), 1000);
        timingObj['Dom parsed time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.domInteractive, timing.domLoading), 1000);
        timingObj['Script Loaded time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.domContentLoadedEventEnd, timing.domContentLoadedEventStart), 1000);
        timingObj['onLoad event time'] = (0, _lodash.divide)((0, _lodash.subtract)(timing.loadEventEnd, timing.loadEventStart), 1000);

        return timingObj;
    }
}
exports.default = Analyzer;