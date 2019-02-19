/**
 * 参数处理, 调用性能分析方法
 */

import { reolve } from 'path';

import * as inquirer from 'inquirer';
import lodash from 'lodash';

import netWorks from './config/network';
import defaultConfig from './config/default';

import Analyzer from './analyzer/analyzer';

inquirer.prompt([
    {
        name: 'url',
        message: 'input your test url',
        type: 'input',
        default: 'https://www.google.com'
    },
    {
        name: 'network',
        message: 'choose your network throttler',
        choices: lodash.keys(netWorks),
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
        cache: cache === 'Yes',
        log: log === 'Yes'
    };

    const analyzer = new Analyzer(config);
    await analyzer.analyze();

    // console.log(config);
});

