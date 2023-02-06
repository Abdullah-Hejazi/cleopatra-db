class QueryBuilder {
    constructor(database, table) {
        this.database = database;
        this.table = table;

        this.parameters = []

        this.type = '';

        this.fields = [];
        this.vals = [];

        this.additions = [];

        this.columns = [];

        this.wheres = [];

        this.indexes = [];
        this.uniques = [];

        return this;
    }

    static select(...fields) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type= 'SELECT';
        queryBuilder.fields = fields ?? [];

        return queryBuilder;
    }

    static describe(database, table) {
        return {
            query: `DESCRIBE \`${database}\`.\`${table}\``,
            parameters: []
        }
    }

    static insert(database, table) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = 'INSERT';
        queryBuilder.database = database;
        queryBuilder.table = table;

        return queryBuilder;
    }

    clone() {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = this.type;
        queryBuilder.database = this.database;
        queryBuilder.table = this.table;

        queryBuilder.fields = this.#cloneArray(this.fields);
        queryBuilder.vals = this.#cloneArray(this.vals);
        queryBuilder.additions = this.#cloneArray(this.additions);
        queryBuilder.columns = this.#cloneArray(this.columns);
        queryBuilder.wheres = this.#cloneArray(this.wheres);
        queryBuilder.indexes = this.#cloneArray(this.indexes);
        queryBuilder.uniques = this.#cloneArray(this.uniques);
        queryBuilder.parameters = this.#cloneArray(this.parameters);

        return queryBuilder;
    }

    static createDatabase(database, charset, collation) {
        let query = `CREATE DATABASE \`${database}\``;
        let parameters = [];

        if (charset) {
            query += ` CHARACTER SET \`${charset}\``;
        }

        if (collation) {
            query += ` COLLATE \`${collation}\``;
        }

        return {
            query: query,
            parameters: parameters
        };
    }

    static dropDatabase(database) {
        let query = `DROP DATABASE \`${database}\``;
        let parameters = [];

        return {
            query: query,
            parameters: parameters
        };
    }

    static createTable(database, table) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = 'CREATE TABLE';
        queryBuilder.database = database;
        queryBuilder.table = table;

        return queryBuilder;
    }

    static dropTable (database, table) {
        let query = `DROP TABLE \`${database}\`.\`${table}\``;
        let parameters = [];

        return {
            query: query,
            parameters: parameters
        };
    }

    static truncateTable (database, table) {
        let query = `TRUNCATE TABLE \`${database}\`.\`${table}\``;
        let parameters = [];

        return {
            query: query,
            parameters: parameters
        };
    }

    static delete (database, table) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = 'DELETE';
        queryBuilder.database = database;
        queryBuilder.table = table;

        return queryBuilder;
    }
        

    static update (database, table) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = 'UPDATE';
        queryBuilder.database = database;
        queryBuilder.table = table;

        return queryBuilder;
    }

    static show(type) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.type = type;

        return queryBuilder;
    }

    from(database, table) {
        this.database = database;
        this.table = table;

        return this;
    }

    where(field, operator, value) {
        var vals = []

        if (operator == 'LIKE') {
            value = `%${value}%`
        }

        if (operator == 'IN') {
            if (typeof value == 'string') {
                vals = value.split(',');
            } else {
                vals = value
            }

            // value = '(';

            // value += vals.map(item => {
            //     if (typeof item == 'string') {
            //         return `'${item.trim()}'`;
            //     }

            //     return `'${item}'`
            // }).join(',')

            // value += ')';
        }

        this.wheres.push({
            field: field,
            operator: operator,
            value: value
        });

        return this;
    }

    orderBy(field, direction) {
        this.additions.push({
            query: `ORDER BY \`${field}\` ${direction}`,
            value: null
        });

        return this;
    }

    limit(limit) {
        this.additions.push({
            query: `LIMIT ?`,
            value: limit
        });

        return this;
    }

    offset(offset) {
        this.additions.push({
            query: `OFFSET ?`,
            value: offset
        });

        return this;
    }

    addColumn(data) {
        let query = `${data.name} ${data.type.label}`;

        query += `${this.#getColumnMetaData(data)}`;

        if (data.defaultValue && data.defaultValue != 'NULL') {
            query += ` DEFAULT ${data.defaultValue}`;
        }

        if (! data.isNull) {
            query += ' NOT NULL';
        }

        if (data.autoIncrement) {
            query += ' AUTO_INCREMENT';
        }

        if (data.index === 'PRIMARY KEY') {
            query += ' PRIMARY KEY';
        }

        this.columns.push(query);

        return this;
    }

    addIndex(type, index) {
        this.indexes.push({
            query: `${type} (?)`,
            value: index
        });
    }

    addInsertion(column, value) {
        this.fields.push({
            column: column,
            value: value
        });

        return this
    }

    addUnique(index) {
        this.indexes.push({
            query: `CONSTRAINT UNIQUE_${index} UNIQUE (?)`,
            value: index
        });
    }

    engine(engine) {
        this.additions.push({
            query: `ENGINE = ?`,
            value: engine
        });

        return this;
    }

    collation(collation) {
        this.additions.push({
            query: `CHARACTER SET = ?`,
            value: collation.CHARACTER_SET_NAME
        })

        this.additions.push({
            query: `COLLATE = ?`,
            value: collation.COLLATION_NAME
        });
    }

    build() {
        if (this.type == 'SELECT') {
            return this.#buildSelect();
        } else if (this.type == 'FULL TABLES' || this.type == 'ENGINES') {
            return this.#buildShow();
        } else if (this.type == 'CREATE TABLE') {
            return this.#buildCreateTable();
        } else if (this.type == 'INSERT') {
            return this.#buildInsert();
        } else if (this.type == 'UPDATE') {
            return this.#buildUpdate();
        } else if (this.type == 'DELETE') {
            return this.#buildDelete();
        }
    }

    // ------------------------Private Methods----------------------------- //

    #getColumnMetaData(column) {
        let result = '(';

        let defaultSizes = [
            {
                type: 'CHAR',
                size: 1
            },
            {
                type: 'VARCHAR',
                size: 255
            },
            {
                type: 'BINARY',
                size: 255
            },
            {
                type: 'VARBINARY',
                size: 255
            },
            {
                type: 'FLOAT',
                size: 24
            },
            {
                type: 'BIT',
                size: 8
            },
            {
                type: 'NUMERIC',
                size: 8
            },
            {
                type: 'DECIMAL',
                size: 8
            }
        ]

        if (column.type.values) {
            let values = column.values.split(',')
        
            // remove spaces from values
            values = values.map(value => '\'' + value.trim() + '\'');

            return `(${values.join(', ')})`;
        }

        if (column.type.size) {
            if (column.size) {
                result += `${column.size}`;
            } else {
                let size = defaultSizes.find(s => s.type === column.type.label);
    
                if (size) {
                    result += `${size.size}`;
                } else {
                    result += '16';
                }
            }
        }

        if (column.type.precision) {
            result += result.length > 1 ? ', ' : '';

            if (column.precision) {
                result += `${column.precision}`;
            } else {
                result += '4';
            }
        }

        result += ')';

        return result.length > 2 ? ' ' + result : '';
    }

    #buildSelect() {
        let query = 'SELECT ';

        query += this.fields.join(', ');

        if (this.database && this.table) {
            query += ` FROM \`${this.database}\`.\`${this.table}\``;
        }

        if (this.wheres.length > 0) {
            query += ' WHERE ';

            query += this.wheres.map(where => {
                if (where.operator == 'IN') {
                    this.parameters.push(where.value);
                    return `\`${where.field}\` ${where.operator} ?`;
                }

                this.parameters.push(where.value);
                return `\`${where.field}\` ${where.operator} ?`;
            }).join(' AND ');
        }

        this.additions.forEach (addition => {
            query += ` ${addition.query}`;
            if (addition.value !== null)
                this.parameters.push(addition.value);
        })

        return {
            query: query,
            parameters: this.parameters
        };
    }

    #buildShow() {
        let query = `SHOW ${this.type}`;


        if (this.database) {
            query += ` FROM \`${this.database}\``;
        }

        return {
            query: query,
            parameters: this.parameters
        };
    }

    #buildCreateTable() {
        let query = `CREATE TABLE \`${this.database}\`.\`${this.table}\` (`;

        // query += this.columns.join(', ');

        let indexes = this.indexes.map(index => {
            this.parameters.push(index.value);
            return `${index.query}`;
        });

        let uniques = this.uniques.map(unique => {
            this.parameters.push(unique.value);
            return `${unique.query}`;
        });

        query += [...this.columns, ...indexes, ...uniques].join(', ');

        query += ')';

        this.additions.forEach (addition => {
            query += ` ${addition.query}`;
            if (addition.value !== null)
                this.parameters.push(addition.value);
        })

        return {
            query: query,
            parameters: this.parameters
        };
    }

    #cloneArray(array) {
        return array.map(item => item);
    }

    #buildInsert() {
        let query = `INSERT INTO \`${this.database}\`.\`${this.table}\` `;

        query += ` (${this.fields.map(field => '`' + field.column + '`').join(', ')})`;
        // this.fields.forEach (field => {
        //     this.parameters.push(field.column);
        // })

        query += ` VALUES (${this.fields.map(field => '?').join(', ')})`;
        this.fields.forEach (field => {
            this.parameters.push(field.value);
        })

        return {
            query: query,
            parameters: this.parameters
        };
    }

    #buildUpdate() {
        let query = `UPDATE \`${this.database}\`.\`${this.table}\` SET `;

        query += this.fields.map(field => `\`${field.column}\` = ?`).join(', ');

        this.fields.forEach (field => {
            this.parameters.push(field.value);
        })

        if (this.wheres.length > 0) {
            query += ' WHERE ';

            query += this.wheres.map(where => {
                if (where.operator == 'IN') {
                    this.parameters.push(where.value);
                    return `\`${where.field}\` ${where.operator} ?`;
                }

                this.parameters.push(where.value);
                return `\`${where.field}\` ${where.operator} ?`;
            }).join(' AND ');
        }

        return {
            query: query,
            parameters: this.parameters
        };
    }

    #buildDelete() {
        let query = `DELETE FROM \`${this.database}\`.\`${this.table}\``;

        if (this.wheres.length > 0) {
            query += ' WHERE ';

            query += this.wheres.map(where => {
                if (where.operator == 'IN') {
                    let values = where.value.map(val => String(val))
                    this.parameters.push(...values);
                    let queryTemp = `\`${where.field}\` ${where.operator} (`;

                    queryTemp += where.value.map(value => '?').join(', ');

                    queryTemp += ')';

                    return queryTemp;
                }

                this.parameters.push(String(where.value));
                return `\`${where.field}\` ${where.operator} ?`;
            }).join(' AND ');
        }

        return {
            query: query,
            parameters: this.parameters
        };
    }
}

export default QueryBuilder;