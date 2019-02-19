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
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const client = await page.target().createCDPSession();

        await client.send('Network.emulateNetworkConditions', this.network);
        await page.goto(this.url);

        const timingObj = {};

        const performanceTiming = JSON.parse(
            await page.evaluate(() => JSON.stringify(window.performance.timing))
        );

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

        await browser.close();
    }

    calcTimes(timing) {
        timing = JSON.parse(timing);
        const timingObj = {};
        timingObj['DNS lookup time'] = lodash.divide(lodash.subtract((timing.domainLookupEnd, timing.domainLookupStart)), 1000);
        timingObj['Tcp connect time'] = lodash.divide(lodash.subtract(timing.connectEnd, timing.connectStart), 1000);
        timingObj['Http request finished Time'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.requestStart), 1000);
        timingObj['Download time of the page'] = lodash.divide(lodash.subtract(timing.responseEnd - timing.navigationStart), 1000);
        timingObj['Dom loaded time'] = lodash.divide(lodash.subtract(timing.domComplete - timing.domLoading), 1000);
        timingObj['Dom parsed time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);
        timingObj['Script Loaded time'] = lodash.divide(lodash.subtract(timing.domInteractive - timing.domLoading), 1000);


        return timingObj;
    }
}
