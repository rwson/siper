import puppeteer from 'puppeteer';
import lodash from 'lodash';

import Logger from './logger';

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
        this.logs = [];
    }

    async analyze() {
        const promiseQueues = [];

        for (let i = 0; i < this.times; i ++) {
            promiseQueues.push(await this.getTimings());
        }

        console.log(promiseQueues);

        await Promise.all(promiseQueues);
    }

    async getTimings() {
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
    }

    calcTimes(timing) {
        const timingObj = {};

        try {
            timing = JSON.parse(timing);
            timingObj['DNS lookup time'] = lodash.divide(lodash.subtract((timing.domainLookupEnd, timing.domainLookupStart)), 1000);
            timingObj['Tcp connect time'] = lodash.divide(lodash.subtract(timing.connectEnd, timing.connectStart), 1000);
            timingObj['Http request finished Time'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.requestStart), 1000);
            timingObj['Download time of the page'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.navigationStart), 1000);
            timingObj['Dom loaded time'] = lodash.divide(lodash.subtract(timing.domComplete - timing.domLoading), 1000);
            timingObj['Dom parsed time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);
            timingObj['Script Loaded time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);
            timingObj['onLoad event time'] = lodash.divide(lodash.subtract(timing.loadEventEnd - timing.loadEventStart), 1000);
        } catch (e) {}

        return timingObj;
    }
}
