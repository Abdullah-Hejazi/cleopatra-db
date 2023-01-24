let pool = null

export default {
    createConnection: async (data) => {
        pool = await mysql.createPool(data)
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