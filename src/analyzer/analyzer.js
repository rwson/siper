import puppeteer from 'puppeteer';
import lodash from 'lodash';
import cliProgress from 'cli-progress';

import Logger from './logger';
import TableLogger from './table';

export default class Analyzer {

    constructor(options) {
        this.url = options.url;
        this.times = options.times;
        this.cache = options.cache;
        this.times = options.times;
        this.network = options.network;
        this.logger = new Logger({
            log: options.log,
            logPath: options.logPath
        });
        this.tableLogger = new TableLogger;
        this.logs = [];
        this.bar = null;
    }

    async analyze() {
        this.bar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
        this.bar.start();
        const promiseQueues = [];

        for (let i = 0; i < this.times; i ++) {
            promiseQueues.push(await this.getTimings(i));
        }

        await Promise.all(promiseQueues);

        this.bar.stop();
        console.log('analyze finished, below is a table based on the number of times and statistical results.');

        await this.logger.generate(this.logs);

        this.tableLogger.printTable(this.logs);

        process.exit(0);
    }

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
        this.bar.update(lodash.multiply(lodash.divide(lodash.add(index, 1), this.times), 100));
    }

    calcTimes(timing) {
        const timingObj = {};
        timingObj['DNS lookup time'] = lodash.divide(lodash.subtract((timing.domainLookupEnd, timing.domainLookupStart)), 1000);
        timingObj['Tcp connect time'] = lodash.divide(lodash.subtract(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished time'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = lodash.divide(lodash.subtract(timing.domComplete - timing.domLoading), 1000);
        timingObj['Dom parsed time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['Script Loaded time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['onLoad event time'] = lodash.divide(lodash.subtract(timing.loadEventEnd - timing.loadEventStart), 1000);

        return timingObj;
    }
}
