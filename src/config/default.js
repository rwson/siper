import dayjs from 'dayjs';

import { resolve } from 'path';

const defaultConfig = {
    network: 'DSL',
    log: true,
    logPath: resolve(process.cwd(), `siper-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.log`)
};

export default defaultConfig;
