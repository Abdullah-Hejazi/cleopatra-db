import { invoke } from '@tauri-apps/api'

class SqlFile {
    constructor(file, clear=false) {
        this.filename = file;
    }

    writeCreateTable(database, table, structure) {
        let insert = `CREATE TABLE \`${table}\` (\n`;
        structure.forEach(column => {
            let defaultVal = column.Default ? `DEFAULT '${column.Default}'` : '';

            insert += `\t\`${column.Field}\` ${column.Type} ${column.Null == "YES" ? 'NULL' : 'NOT NULL'} ${defaultVal} ${column.Key == 'PRI' ? 'PRIMARY KEY' : ''},\n`;
        });
        insert = insert.slice(0, -2);
        insert += '\n);\n\n';

        structure.forEach(column => {
            if (column.Key == 'UNI') {
                insert += `ALTER TABLE \`${table}\` ADD UNIQUE (${column.Field});\n`;
            }
            if (column.Key == 'MUL') {
                insert += `ALTER TABLE \`${table}\` ADD INDEX (${column.Field});\n`;
            }
        });

        insert += '\n';

        this.write(insert)
    }

    writeInsert(database, table, data) {
        data.forEach(line => {
            this.write(this.getInsertStatement(database, table, line))
        })

        this.write('\n\n')
    }

    formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    getInsertStatement(database, table, data) {
        let columns = Object.keys(data).join('`, `');

        let values = Object.values(data).map(value => {
            if (typeof value == 'string') {
                value = value.replaceAll('"', '\\"');
                value = value.replaceAll(/(?:\r\n|\r|\n)/g, '\\n');
                return `"${value}"`;
            }

            if (value instanceof Date && !isNaN(value)) {
                return `"${formatDate(value)}"`;
            }

            if (value === null) {
                return 'NULL';
            }

            return `"${value}"`
        }).join(', ');

        return `INSERT INTO \`${table}\` (\`${columns}\`) VALUES (${values});\n`;
    }

    async write(data) {
        await invoke('append_file', {
            path: this.filename,
            content: data
        })
    }
}

export default SqlFile;