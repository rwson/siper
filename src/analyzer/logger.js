import * as fse from 'fs-extra-promise';

export default class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    async generate(logs) {
        if (!this.enable) {
            return;
        }
    }

}
