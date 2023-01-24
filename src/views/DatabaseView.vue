<script>

import TablesList from '@/components/TablesList.vue'
import TableView from '@/views/TableView.vue'

export default {
    name: 'DatabaseView',

    components: {
        TablesList,
        TableView
    },

    data() {
        return {
            error: '',

            tables: [],
            views: [],
            sysViews: [],
            engines: [],

            database: '',
            table: ''
        }
    },

    methods: {
        RefreshTables() {
            this.error = ''
            this.$loading.show()

            this.$store.dispatch('database/getDatabase', this.$route.params.database).then((result) => {
                this.tables = []
                this.views = []
                this.sysViews = []
                this.engines = []

                if (! result.success) {
                    this.error = result.error
                } else {
                    result.data.forEach((item, index) => {
                        let temp = {
                            label: item[result.name],
                            icon: 'pi pi-table',
                            index: index
                        }

                        if (item.Table_type === 'BASE TABLE') {
                            this.tables.push(temp)
                        } else if (item.Table_type === 'VIEW') {
                            this.views.push(temp)
                        } else if (item.Table_type === 'SYSTEM VIEW') {
                            this.sysViews.push(temp)
                        }
                    })

                    this.engines = result.engines
                }
            }).catch((error) => {
                this.error = error
            }).finally(() => {
                this.$loading.hide()
            })
        },

        LoadTable(name) {
            this.table = name
        },

        DeleteTable() {
            this.table = ''
            this.RefreshTables()
        }
    },

    mounted () {
        this.database = this.$route.params.database

        this.RefreshTables()
    },

    computed: {
        data () {
            let result = []

            if (this.tables.length > 0) {
                result.push({
                    label: 'Tables',
                    items: this.tables
                })
            }

            if (this.views.length > 0) {
                if (result.length > 0) {
                    result.push({
                        separator: true
                    })
                }

                result.push({
                    label: 'Views',
                    items: this.views
                })
            }

            if (this.sysViews.length > 0) {
                if (result.length > 0) {
                    result.push({
                        separator: true
                    })
                }
                result.push({
                    label: 'System Views',
                    items: this.sysViews
                })
            }

            return result
        }
    }
}

</script>

<template>
    <div class="tables">
        <div v-if="error" class="mx-5 mt-5">
            <InlineMessage severity="error" class="w-full scalein select-text">
                {{ error }}
            </InlineMessage>
        </div>

        <div class="p-0 md:flex justify-content-start">
            <div class="col-12 md:col-4 xl:col-2 mt-3 p-0">
                <TablesList
                    :database="database"
                    :data="data"
                    :engines="engines"
                    :refresh="RefreshTables"
                    :load="LoadTable"
                />
            </div>

            <div class="col-12 md:col-8 xl:col-10 mt-3 p-0 sm:pl-3" v-if="table">
                <TableView :table="table" :deleteTable="DeleteTable" />
            </div>
        </div>
    </div>
</template>

<style>
.scroll-menu {
    height: calc(100vh - 190px);
}

.scroll-menu2 {
    height: calc(100vh - 268px);
}

</style>