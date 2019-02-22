import { writeFileSync } from 'fs';

export default class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    async generate(logs, cssCoverages, jsCoverages) {
        if (!this.enable) {
            return;
        }

        try {
            writeFileSync(this.logPath, JSON.stringify({
                logs,
                cssCoverages,
                jsCoverages
            }, null, 2));
            console.log(`your log was saved to ${this.logPath}.`);
        } catch (e) {}
    }

}
