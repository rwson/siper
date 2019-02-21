#!/usr/bin/env node

/**
 * 参数处理, 调用性能分析方法
 */
import lodash from 'lodash';

import { prompt } from 'enquirer';

import netWorks from './config/network';
import defaultConfig from './config/default';

import Analyzer from './analyzer/analyzer';

const urlPattern = new RegExp('^((ft|htt)ps?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');

const init = ({ url, network, times, cache, log }) => {
    const config = {
        ...defaultConfig,
        url,
        network: netWorks[network],
        times: Number(times),
        cache: cache === 'No',
        log: log === 'Yes'
    };

    const analyzer = new Analyzer(config);
    analyzer.analyze();
};

// init({});

prompt([
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
        type: 'select',
        message: 'choose your network throttler',
        scroll: false,
        choices: lodash.keys(netWorks).reverse()
    },
    {
        name: 'cache',
        type: 'select',
        message: 'would you disable cache to analyze your website',
        scroll: false,
        choices: ['Yes', 'No']
    },
    {
        name: 'times',
        message: 'how many times would you want to analyze your website',
        type: 'input',
        default: '1'
    },
    {
        name: 'log',
        type: 'select',
        message: 'would you want to export the log after analysis',
        scroll: false,
        choices: ['Yes', 'No']
    }
]).then(init);
