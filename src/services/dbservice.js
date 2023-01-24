import { invoke } from '@tauri-apps/api'

let pool = null

export default {
    createConnection: async (data) => {
        console.log('here')
        return invoke('login', {
            host: data.host,
            username: data.username,
            password: data.password,
            port: data.port
        })
    },

    getConnection: () => {
        return pool
    },

    query: (...data) => {
        let query = '';
        let parameters = [];

        data.forEach(item => {
            if (item.query) {
                query += item.query + ';'
            }

            if (item.parameters) {
                parameters.push(...item.parameters)
            }
        })

        return pool.query(query, parameters)
    },

    bulkQuery: (query) => {
        return pool.query(query)
    },

    endConnection: () => {
        pool?.end();
        pool = null;
    }
};