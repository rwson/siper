import * as fs from 'fs';

export default class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    async generate(logs) {
        if (!this.enable) {
            return;
        }
        fs.writeFileSync(this.logPath, JSON.stringify({
            logs
        }, null, 2));
    }

}
