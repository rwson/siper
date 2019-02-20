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
        console.log(JSON.stringify({
            logs
        }, null, 2));
        await fse.writeJson(this.logPath, {
            logs
        });
    }

}
