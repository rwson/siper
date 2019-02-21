'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    generate(logs) {
        var _this = this;

        return _asyncToGenerator(function* () {
            if (!_this.enable) {
                return;
            }

            try {
                (0, _fs.writeFileSync)(_this.logPath, JSON.stringify({
                    logs
                }, null, 2));
            } catch (e) {}
        })();
    }

}
exports.default = Logger;