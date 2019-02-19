import * as fse from 'fs-extra-promise';

export default class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    async generate() {
        if (!this.enable) {
            return;
        }
    }

}
