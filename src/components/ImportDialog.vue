<script>

import SqlFileService from '@/services/sqlfileservice'
import DBService from '@/services/dbservice'

export default {
    name: 'ImportDialog',

    props: [
        'visible',
        'database'
    ],

    data () {
        return {
            active: false,
            sqlFile: ''
        }
    },

    mounted () {
        this.active = this.visible
    },

    methods: {
        SelectFile () {
            // let file = ipcRenderer.sendSync('open-file')

            if (file && file[0]) {
                this.sqlFile = file[0]
            } else {
                return;
            }
        },

        ImportFile () {
            let queries = new SqlFileService().import(this.sqlFile);

            if (! queries?.data) {
                return;
            }

            queries.data.unshift('USE ' + this.$route.params.database)

            // this.$loading.show()
            return;

        }
    },

    watch: {
        active (value) {
            this.$emit('visibilityChange', value)
        },

        visible (value) {
            this.active = value
        }
    }
}
</script>

<template>
    <Dialog class="dialog-width" v-model:visible="active" :header="$t('import.import_database')" :modal="true">
        <div class="border-dashed border-gray-600 text-center" @click="SelectFile">
            <div class="text-3xl text-gray-600 p-5" v-if="! sqlFile">
                {{ $t('import.select_file') }}
                <i class="pi pi-upload text-3xl"></i>
            </div>

            <div class="text-xl text-gray-600 p-5 import-text" v-if="sqlFile" v-tooltip.bottom="sqlFile">
                {{ sqlFile }}
            </div>
        </div>

        <div class="text-center" v-if="sqlFile">
            <Button :label="$t('import.import')" @click="ImportFile" class="mt-3 w-full" />
        </div>
    </Dialog>
</template>

<style>
.dialog-width {
    width: 400px;
    max-width: 90vw;
}

.import-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
