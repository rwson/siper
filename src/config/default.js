/**
 * 配置文件
 */

import dayjs from 'dayjs';

import { resolve } from 'path';

const LOG_DIR = resolve(process.cwd(), 'siper-logs');

const defaultConfig = {
    network: 'DSL',
    log: true,
    trace: true,
    logDir: LOG_DIR,
    logPath: resolve(LOG_DIR, `siper-times-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.log`),
    tracePath: resolve(LOG_DIR, `siper-trace-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.json`)
};

export default defaultConfig;
