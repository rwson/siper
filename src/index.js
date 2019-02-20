#!/usr/bin/env node

/**
 * 参数处理, 调用性能分析方法
 */

import { reolve } from 'path';

import * as fs from 'fs-extra-promise';

import * as inquirer from 'inquirer';
import lodash from 'lodash';

import netWorks from './config/network';
import defaultConfig from './config/default';

import Analyzer from './analyzer/analyzer';

console.log(fs.writeFile('a.log', '爱上的计划把手机好多把设计好的吧'));

const urlPattern = new RegExp('^((ft|htt)ps?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');

inquirer.prompt([
    {
        name: 'url',
        message: 'input your test url',
        type: 'input',
        default: 'https://www.baidu.com',
        validate(url) {
            return urlPattern.test(url) ? true : 'please input a valid url';
        }
    },
    {
        name: 'network',
        message: 'choose your network throttler',
        choices: lodash.keys(netWorks).reverse(),
        type: 'list'
    },
    {
        name: 'cache',
        message: 'would you disable cache to analyze your website',
        choices: ['Yes', 'No'],
        type: 'list'
    },
    {
        name: 'times',
        message: 'how many times would you want to analyze your website',
        type: 'input',
        default: '1'
    },
    {
        name: 'log',
        message: 'would you want to export the log after analysis',
        choices: ['Yes', 'No'],
        type: 'list'
    }
]).then(async({ url, network, times, cache, log }) => {
    const config = {
        ...defaultConfig,
        url,
        network: netWorks[network],
        times: Number(times),
        cache: cache === 'No',
        log: log === 'Yes'
    };

    const analyzer = new Analyzer(config);
    await analyzer.analyze();
});

