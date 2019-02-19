/**
 * 表格日志打印
 */
import Table from 'cli-table';

export default class TableLogger {

    async printTable(logs) {
        const table = new Table({
            head: [
                'time',
                'DNS lookup time(s)',
                'Tcp connect time(s)',
                'Http request finished time(s)',
                'Download time of the page(s)',
                'Dom loaded time(s)',
                'Dom parsed time(s)',
                'Script Loaded time(s)',
                'onLoad event time(s)'
            ]
        });
        const rows = logs.map((log, index) => {
            return [
                (index + 1),
                log['DNS lookup time'],
                log['Tcp connect time'],
                log['Http request finished time'],
                log['Download time of the page'],
                log['Dom loaded time'],
                log['Dom parsed time'],
                log['Script Loaded time'],
                log['onLoad event time']
            ];
        });

       table.push(...rows);

        console.log(table.toString());
    }
}
