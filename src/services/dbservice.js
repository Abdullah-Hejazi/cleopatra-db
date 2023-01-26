import { invoke } from '@tauri-apps/api'

export default {
    createConnection: async (data) => {
        return new Promise( (resolve, reject) => {
            invoke('login', {
                host: data.host,
                username: data.user,
                password: data.password,
                port: data.port
            }).then(result => {
                resolve(result)
            }).catch(error => {
                reject(error)
            })
        });
    },

    getConnection: () => {
        return pool
    },

    query: (...data) => {
        let promises = [];

        data.forEach(item => {
            promises.push(
                new Promise( (resolve, reject) => {
                    invoke('query', {
                        query: item.query,
                        params: item.parameters.map(param => String(param))
                    }).then(result => {
                        resolve(result)
                    }).catch(error => {
                        reject(error)
                    })
                })
            )
        })

        return Promise.all(promises).catch(error => {
            console.error(error)
        })
    },

    endConnection: () => {
        pool?.end();
        pool = null;
    }
};