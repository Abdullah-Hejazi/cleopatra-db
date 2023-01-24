import dbservice from '@/services/dbservice'
import QueryBuilder from '@/services/querybuilder'
import SqlFile from '@/services/sqlfile'

class DatabaseManager {
    /*
        options = {
            database: 'DB NAME', // database name
            table: 'Table Name', // table name
            linesPerPatch: 1000, // number of lines read from database each iteration (used for large databases so it doesn't consume the memory)
            file: 'path/to/file.sql', // path to file to write the export to
            clear: true // used to tell if the file should be erased before exporting to, or appending to a currently existing file
        }
    */
    static async exportTable(options) {
        let count = await this.getTableCount(options.database, options.table);
        let structure = await this.getTableStructure(options.database, options.table);

        const linesPerPatch = options.linesPerPatch || 1000;

        const sqlFile = new SqlFile(options.file, options.clear);
        sqlFile.writeCreateTable(options.table, structure.structure);

        let query = QueryBuilder.select('*');
        query.from(options.database, options.table);

        let iterations = Math.ceil(count.count / linesPerPatch);

        for (let i = 0; i < iterations; i++) {
            let query = QueryBuilder.select('*');
            query.from(options.database, options.table);
            query.limit(linesPerPatch).offset(i * linesPerPatch);

            let [rows] = await dbservice.query(query.build());

            sqlFile.writeInsert(options.table, rows);
        }

        sqlFile.close();
    }

    static async getTableStructure(database, table) {
        try {
            let describeQuery = QueryBuilder.describe(database, table);
            let structure = await dbservice.query(describeQuery);

            return {
                sucess: true,
                structure: structure[0]
            }
        } catch (e) {
            return {
                sucess: false,
                error: e.message
            }
        }
    }

    static async getTableCount(database, table) {
        try {
            let countQuery = QueryBuilder.select('COUNT(*) as count');
            countQuery.from(database, table);

            let [count] = await dbservice.query(countQuery.build());

            return {
                sucess: true,
                count: count[0].count
            }
        } catch (e) {
            return {
                sucess: false,
                error: e.message
            }
        }
    }

    static async getDatabaseList() {
        try {
            let query1 = QueryBuilder.select('*').from('information_schema', 'SCHEMATA').build();
            let query2 = QueryBuilder.select('*').from('information_schema', 'COLLATIONS').build();

            let [result] = await dbservice.query(query1, query2);

            return {
                sucess: true,
                databases: result[0],
                collations: result[1]
            }

        } catch (e) {
            return {
                sucess: false,
                error: e.message
            }
        }
    }

    static async createDatabase(name, characterset, collation) {
        try {
            let query = QueryBuilder.createDatabase(
                name,
                characterset,
                collation
            );

            await dbservice.query(query)
        } catch (e) {
            return {
                sucess: false,
                error: e.message
            }
        }

        return {
            success: true
        }
    }
}

export default DatabaseManager