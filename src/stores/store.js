import database from '@/stores/database'
import { createStore } from 'vuex'

const store = createStore({
    modules: {
        database: database
    }
})

export default store;