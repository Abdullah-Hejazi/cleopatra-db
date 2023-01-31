<script>

import DatabaseManager from '@/services/databasemanager'
import { save } from '@tauri-apps/api/dialog';

export default {
    name: 'ExportDialog',

    props: [
        'visible',
        'database',
        'table',
        'title'
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
        async SelectFile () {
            const file = await save({
                title: 'Select a file to export to'
            });

            if (file) {
                this.sqlFile = file
            } else {
                return;
            }
        },

        async ExportFile () {
            this.$loading.show()

            if (this.table) {
                await DatabaseManager.exportTable({
                    database: this.database,
                    file: this.sqlFile,
                    table: this.table,
                    clear: true
                })
            } else {
                await DatabaseManager.exportDatabase({
                    database: this.database,
                    file: this.sqlFile,
                    clear: true
                })
            }
            

            this.active = false

            this.$loading.hide()

            this.$toast.add({
                severity:'success',
                summary: this.$t('export.success'),
                detail: this.$t('export.success_message'),
                life: 3000
            });

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
    <Dialog class="dialog-width" v-model:visible="active" :header="title" :modal="true">
        <div class="border-dashed border-gray-600 text-center" @click="SelectFile">
            <div class="text-3xl text-gray-600 p-5" v-if="! sqlFile">
                {{ $t('export.select_file') }}
                <i class="pi pi-download text-3xl"></i>
            </div>

            <div class="text-xl text-gray-600 p-5 export-text" v-if="sqlFile" v-tooltip.bottom="sqlFile">
                {{ sqlFile }}
            </div>
        </div>

        <div class="text-center" v-if="sqlFile">
            <Button :label="$t('export.export')" @click="ExportFile" class="mt-3 w-full" />
        </div>
    </Dialog>
</template>

<style>
.dialog-width {
    width: 400px;
    max-width: 90vw;
}

.export-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
