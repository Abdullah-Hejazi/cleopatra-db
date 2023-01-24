import QueryBuilder from '@/services/querybuilder'
import fs from 'fs'

class SqlFile {
    constructor(file, clear=false) {
        this.file = fs.createWriteStream(file, {flags: clear ? 'w' : 'a'});
    }

    writeCreateTable(table, structure) {
        let insert = `CREATE TABLE ${table} (\n`;
        structure.forEach(column => {
            let defaultVal = column.Default ? `DEFAULT '${column.Default}'` : '';

            insert += `\t\`${column.Field}\` ${column.Type} ${column.Null == "YES" ? 'NULL' : 'NOT NULL'} ${defaultVal} ${column.Key == 'PRI' ? 'PRIMARY KEY' : ''},\n`;
        });
        insert = insert.slice(0, -2);
        insert += '\n);\n\n';

        structure.forEach(column => {
            if (column.Key == 'UNI') {
                insert += `ALTER TABLE ${table} ADD UNIQUE (${column.Field});\n`;
            }
            if (column.Key == 'MUL') {
                insert += `ALTER TABLE ${table} ADD INDEX (${column.Field});\n`;
            }
        });

        insert += '\n';

        this.file.write(insert);
    }

    writeInsert(table, data) {
        data.forEach(line => {
            this.file.write(this.getInsertStatement(table, line));
        })

        this.file.write('\n\n');
    }

    getInsertStatement(table, data) {
        let columns = Object.keys(data).join('`, `');

        let values = Object.values(data).map(value => {
            if (typeof value == 'string') {
                value = value.replace('"', '\\"');
                value = value.replace(/(?:\r\n|\r|\n)/g, '\\n');
                return `"${value}"`;
            }

            if (value instanceof Date && !isNaN(value)) {
                return `"${value.toISOString().slice(0, 19).replace('T', ' ')}"`;
            }

            if (value === null) {
                return 'NULL';
            }

            return `"${value}"`
        }).join(', ');

        return `INSERT INTO ${table} (\`${columns}\`) VALUES (${values});\n`;
    }

    close() {
        this.file.end();
    }
}

export default SqlFile;