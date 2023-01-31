// import mysql from 'mysql2/promise'
import dbservice from '@/services/dbservice'
import QueryBuilder from '@/services/querybuilder'
import { invoke } from '@tauri-apps/api'

const database = {
    namespaced: true,

    state() {
        return {
            connected: false,
            data: null,
            databases: [],
            collations: []
        }
    },

    mutations: {
        setConnected(state, connected) {
            state.connected = connected
        },

        setData(state, data) {
            state.data = data
        },

        setDatabases(state, databases) {
            state.databases = databases
        },

        setCollations(state, collations) {
            state.collations = collations
        }
    },

    actions: {
        async connect(context, form) {
            await context.dispatch('clearConnection')

            let data = {
                host: form.host.length > 0 ? form.host : 'localhost',
                user: form.username,
                port: form.port ? form.port.toString() : '3306',
                password: form.password,
                multipleStatements: true
            }

            await dbservice.createConnection(data)

            
            context.commit('setData', data)
            context.commit('setConnected', true)

            return '';
        },

        async refreshDatabases(context) {
            try {
                let query1 = QueryBuilder.select('*').from('information_schema', 'SCHEMATA').build();
                let query2 = QueryBuilder.select('*').from('information_schema', 'COLLATIONS').build();

                let result = await dbservice.query(query1, query2)

                context.commit('setDatabases', result[0])
                context.commit('setCollations', result[1])

                return {
                    success: true
                }
            } catch (e) {
                return {
                    success: false,
                    error: e
                }
            }
        },

        async createDatabase(context, form) {
            try {
                let query = QueryBuilder.createDatabase(
                    form.name,
                    form.collation.CHARACTER_SET_NAME,
                    form.collation.COLLATION_NAME
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
        },

        async dropDatabase(context, schema) {
            try {
                let query = QueryBuilder.dropDatabase(schema);

                await dbservice.query(query);

            } catch (e) {
                return {
                    sucess: false,
                    error: e.message
                }
            }

            return {
                success: true
            }
        },

        async getDatabase(context, schema) {
            let result = []
            let name = ''
            let engines = []

            try {
                let query = QueryBuilder.show('FULL TABLES').from(schema).build();
                let query2 = QueryBuilder.show('ENGINES').build();

                result = await dbservice.query(query, query2);

                result = result[0]
                engines = result[1]

            } catch (e) {
                return {
                    sucess: false,
                    error: e.message
                }
            }

            return {
                success: true,
                data: result,
                engines: engines
            }
        },

        async createTable(context, form) {
            try {
                let query = QueryBuilder.createTable(form.databaseName, form.tableName);

                form.columns.forEach(column => {
                    query.addColumn(column);

                    if (column.index == 'UNIQUE') {
                        query.addUnique(column.name);
                    } else if (column.index && column.index !== 'PRIMARY KEY') {
                        query.addIndex(column.index, column.name);
                    }
                })


                if (form.engine) {
                    query.engine(form.engine.Engine);
                }

                if (form.collation) {
                    query.collation(form.collation);
                }

                await dbservice.query(query.build())

            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true
            }
        },

        async loadTable(context, form) {
            let result = []

            try {
                let describeQuery = QueryBuilder.describe(form.database, form.table);

                let query = QueryBuilder.select('*');
                query.from(form.database, form.table);

                if (form.search?.value && form.search?.field?.name) {
                    query.where(form.search.field.name, form.search.operator, form.search.value);
                }

                if (form.sort) {
                    query.orderBy(form.sort.field, form.sort.order);
                }

                let countQuery = query.clone();
                countQuery.fields = ['COUNT(*) as count']
    
                query.limit(form.perPage).offset(form.page);

                result = await dbservice.query(query.build(), countQuery.build(), describeQuery)

            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true,
                data: result
            }
        },

        async dropTable(context, form) {
            let result = []

            try {
                let query = QueryBuilder.dropTable(form.database, form.table);

                result = await dbservice.query(query)
            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: false,
                data: result
            }
        },

        async insertRow(context, form) {
            try {
                let query = QueryBuilder.insert(form.database, form.table);

                for (const field in form.row) {
                    query.addInsertion(field, form.row[field]);
                }

                await dbservice.query(query.build())

            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true
            }
        },

        async updateRow(context, form) {
            try {
                let query = QueryBuilder.update(form.database, form.table);

                query.where(form.key, '=', form.original[form.key]);

                for (const field in form.row) {
                    if (form.row[field] !== form.original[field]) {
                        query.addInsertion(field, form.row[field]);
                    }
                }

                await dbservice.query(query.build())
            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true
            }
        },

        async deleteRows(context, form) {
            try {
                let query = QueryBuilder.delete(form.database, form.table);

                query.where(form.key, 'IN', form.values);

                let builtQuery = query.build();

                let result = await dbservice.query(builtQuery)
            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true
            }
        },

        async clearConnection(context) {
            context.commit('setData', null)
            context.commit('setConnected', false)
            // await dbservice.endConnection();
        },

        async executeQuery(context, query) {
            let result = []

            try {
                result = await dbservice.rawQuery(query)
            } catch (e) {
                return {
                    success: false,
                    error: e.message
                }
            }

            return {
                success: true,
                data: result
            }
        },
    },
}

export default database;