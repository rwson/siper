'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 表格日志打印
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


class TableLogger {

    printTable(logs) {
        return _asyncToGenerator(function* () {
            if (logs.length === 0) {
                return;
            }
            const table = new _cliTable2.default({
                head: ['time', 'DNS lookup time(s)', 'Tcp connect time(s)', 'Http request finished time(s)', 'Download time of the page(s)', 'Dom loaded time(s)', 'Dom parsed time(s)', 'Script Loaded time(s)', 'onLoad event time(s)']
            });
            const rows = logs.map(function (log, index) {
                return [index + 1, log['DNS lookup time'], log['Tcp connect time'], log['Http request finished time'], log['Download time of the page'], log['Dom loaded time'], log['Dom parsed time'], log['Script Loaded time'], log['onLoad event time']];
            });

            table.push(...rows);

            console.log(table.toString());
        })();
    }
}
exports.default = TableLogger;