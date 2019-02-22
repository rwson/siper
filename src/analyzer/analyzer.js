import puppeteer from 'puppeteer';

import { divide, subtract, multiply, add } from 'lodash';
import cliProgress from 'cli-progress';
import prettyBytes from 'pretty-bytes';

import { basename } from 'path';

import Logger from './logger';
import TableLogger from './table';

const INNER_STYLE_TAG = 'inner style tag';
const LINK_STYLE_TAG = 'link style tag';
const SRC_SCRIPT_TAG = 'src script tag';
const INNER_SCRIPT_TAG = 'inner script tag';

const JS_REG = /.js$/;
const CSS_REG = /.css$/;

export default class Analyzer {

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

        this.logger = new Logger({
            log: options.log,
            logPath: options.logPath
        });
        this.tableLogger = new TableLogger;
    }

    /**
     * 性能分析入口方法
     * @return {Promise<void>}
     */
    async analyze() {
        this.bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

        console.log('analyze started, please wait a moment ...');

        const promiseQueues = [];

        this.bar.start();

        for (let i = 0; i < this.times; i++) {
            promiseQueues.push(await this.getTimings(i));
        }

        await Promise.all(promiseQueues);

        this.bar.stop();

        if (this.coverage) {
            await this.calcCoverages();
        }

        console.log('start generate log ...');

        if (this.trace) {
            await this.traceTimeline();
        }

        if (this.coverage) {
            await this.logger.generate(this.logs, this.cssCoverages, this.jsCoverages);
        } else {
            await this.logger.generate(this.logs);
        }

        console.log('analyze finished, below is a table based on the number of times and statistical results.');

        this.tableLogger.printTable(this.logs);

        process.exit(0);
    }

    /**
     * 获取当前次数的加载时间
     * @param index Number  当前第几次
     * @return {Promise<void>}
     */
    async getTimings(index) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const client = await page.target().createCDPSession();

        await client.send('Network.emulateNetworkConditions', this.network);
        await page.setCacheEnabled(this.cache);

        await page.goto(this.url, {
            timeout: 0
        });

        const performanceTiming = JSON.parse(
            await page.evaluate(() => JSON.stringify(window.performance.timing))
        );

        this.logs.push(this.calcTimes(performanceTiming));

        await browser.close();
        this.bar.update(multiply(divide(add(index, 1), this.times), 100));
    }

    /**
     * 计算CSS/js覆盖率
     * @return {Promise<void>}
     */
    async calcCoverages() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await Promise.all([
            page.coverage.startJSCoverage(),
            page.coverage.startCSSCoverage()
        ]);
        await page.goto(this.url);
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);

        await browser.close();

        let totalBytes = 0;
        let usedBytes = 0;
        let fileName = '';
        let isInner = false;

        this.jsCoverages = [...jsCoverage].map((coverage) => {
            totalBytes = coverage.text.length;
            usedBytes = 0;

            fileName = basename(coverage.url);

            for (const range of coverage.ranges) {
                usedBytes += range.end - range.start - 1;
            }

            isInner = JS_REG.test(fileName);

            return {
                type: !isInner ? INNER_SCRIPT_TAG : SRC_SCRIPT_TAG,
                name: !isInner ? 'no name' : fileName,
                totalBytes: prettyBytes(totalBytes),
                usedBytes: prettyBytes(usedBytes),
                coverage: `${multiply(divide(usedBytes, totalBytes), 100)}%`
            };
        });

        this.cssCoverages = [...cssCoverage].map((coverage) => {
            totalBytes = coverage.text.length;
            usedBytes = 0;

            fileName = basename(coverage.url);

            for (const range of coverage.ranges) {
                usedBytes += range.end - range.start - 1;
            }

            isInner = CSS_REG.test(fileName);

            return {
                type: !isInner ? INNER_STYLE_TAG : LINK_STYLE_TAG,
                name: !isInner ? 'no name' : fileName,
                totalBytes: prettyBytes(totalBytes),
                usedBytes: prettyBytes(usedBytes),
                coverage: `${multiply(divide(usedBytes, totalBytes), 100)}%`
            };
        });
    }

    /**
     * 跟踪timeline
     * @return {Promise<void>}
     */
    async traceTimeline() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.tracing.start({
            path: this.tracePath,
            screenshots: true
        });
        await page.goto(this.url);
        await page.tracing.stop();
        await browser.close();

        console.log(`your trace log was saved to ${this.tracePath}.`);
    }

    /**
     * 计算时间
     * @param  timing    Object
     * @return Object
     */
    calcTimes(timing) {
        const timingObj = {};

        timingObj['DNS lookup time'] = divide(subtract(timing.domainLookupEnd, timing.domainLookupStart), 1000);
        timingObj['Tcp connect time'] = divide(subtract(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished time'] = divide(subtract(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = divide(subtract(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = divide(subtract(timing.domComplete, timing.domLoading), 1000);
        timingObj['Dom parsed time'] = divide(subtract(timing.domInteractive, timing.domLoading), 1000);
        timingObj['Script Loaded time'] = divide(subtract(timing.domContentLoadedEventEnd, timing.domContentLoadedEventStart), 1000);
        timingObj['onLoad event time'] = divide(subtract(timing.loadEventEnd, timing.loadEventStart), 1000);

        return timingObj;
    }
}
