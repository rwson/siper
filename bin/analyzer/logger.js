'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fsExtraPromise = require('fs-extra-promise');

var fse = _interopRequireWildcard(_fsExtraPromise);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Logger {

    constructor(options) {
        this.enable = options.log;
        this.logPath = options.logPath;
    }

    generate() {
        var _this = this;

        return _asyncToGenerator(function* () {
            if (!_this.enable) {
                return;
            }
        })();
    }

}
exports.default = Logger;