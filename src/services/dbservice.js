import { invoke } from '@tauri-apps/api'

export default {
    createConnection: async (data) => {
        return invoke('login', {
            host: data.host,
            username: data.user,
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

        return invoke('query', {
            query: query,
            params: parameters
        })
    },

    endConnection: () => {
        pool?.end();
        pool = null;
    }
};