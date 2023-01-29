<script>

import CreateTableDialog from '@/components/CreateTableDialog.vue'
import ImportDialog from '@/components/ImportDialog.vue'
import ExportDialog from '@/components/ExportDialog.vue'
import SqlEditor from './SqlEditor.vue'

export default {
    name: 'TablesList',

    components: {
        CreateTableDialog,
        ImportDialog,
        ExportDialog,
        SqlEditor
    },

    data() {
        return {
            items: [
                {
                    label: 'General',
                    items: [
                        {
                            label: 'Refresh Tables',
                            icon: 'pi pi-refresh',
                            command: this.refresh
                        }
                    ]
                },
                {
                    label: 'Control',
                    items: [
                        {
                            label: 'Create Table',
                            icon: 'pi pi-plus',
                            command: () => {
                                this.createTableDialog = true
                            }
                        },
                        {
                            label: 'SQL Editor',
                            icon: 'pi pi-hashtag',
                            command: () => this.SqlEditorDialog = true
                        },
                        {
                            label: 'Import',
                            icon: 'pi pi-upload'
                        },
                        {
                            label: 'Export',
                            icon: 'pi pi-download'
                        },
                        {
                            label: 'Drop Database',
                            icon: 'pi pi-trash',
                            command: () => this.deleteDatabaseDialog = true
                        }
                    ]
                }
            ],

            createTableDialog: false,
            importDialog: false,
            exportDialog: false,


            deleteDatabaseDialog: false,

            SqlEditorDialog: false
        }
    },

    props: [
        'database',
        'data',
        'refresh',
        'create',
        'sql',
        'export',
        'import',
        'engines',
        'load'
    ],

    methods: {
        ToggleMenu() {
            this.$refs.menu.toggle(event);
        },

        FinishTableCreation() {
            this.refresh()
            this.createTableDialog = false
        },

        LoadTable(table) {
            for(let i = 0; i < this.data.length; i++) {
                for (let j = 0; j < this.data[i].items?.length; j++) {
                    this.data[i].items[j].selected = false
                }
            }

            table.selected = true

            this.load(table.label)
        },

        async ImportData() {
            
        },

        DeleteDatabaseDoubleCheck() {
            this.deleteDatabaseDialog = false
            this.$confirm.require({
                header: this.$t('home.drop_database_ask'),
                message: this.$t('home.drop_database_ask_message', { database: this.$route.params.database }),
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                rejectClass: 'p-button-plain p-button-text',
                autofocus: false,
                acceptLabel: this.$t('general.delete'),
                rejectLabel: this.$t('general.cancel'),
                accept: () => {
                    this.DeleteDatabase()
                }
            });
        },

        async DeleteDatabase() {
            this.$loading.show()

            this.$store.dispatch('database/dropDatabase', this.$route.params.database).then((result) => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: this.$t('home.database_deleted'),
                        detail: this.$t('home.database_deleted_message'),
                        life: 3000
                    });

                    this.$router.push('/databases')
                } else {
                    this.error = result.error;
                }
            }).finally(() => {
                this.$loading.hide()
            })
        },
    }
}
</script>

<template>
    <div>
        <Panel :header="database">
            <template #icons>
                <Button class="p-panel-header-icon p-link mr-2" @click="ToggleMenu">
                    <span class="pi pi-cog"></span>
                </Button>
                <Menu id="config_menu" ref="menu" :model="items" :popup="true"></Menu>
            </template>

            <ScrollPanel class="w-full scroll-menu" v-if="data.length > 0">
                <Menu :model="data" class="w-full">
                    <template #item="{ item }">
                        <div :class="'p-menuitem-link pl-4 ' + (item.selected ? 'text-primary' : 'text-700')" v-if="! item.items" @click="LoadTable(item)">
                            <span class="pi pi-angle-right mt-1 mr-2" />
                            {{ item.label }}
                        </div>
                    </template>
                </Menu>
            </ScrollPanel>

            <div v-if="data.length == 0" class="text-center py-5">
                <span class="pi pi-exclamation-circle"></span>
                No tables or views found.
            </div>
        </Panel>

        <Dialog class="create-table-modal" header="Create Table" v-model:visible="createTableDialog" :modal="true">
            <CreateTableDialog :finish="FinishTableCreation" :engines="engines" />
        </Dialog>

        <ImportDialog :visible="importDialog" @visibilityChange="val => importDialog = val" />

        <ExportDialog :database="database" :visible="exportDialog" @visibilityChange="val => exportDialog = val" />

        <Dialog :draggable="false" :modal="true" :header="$t('home.drop_database_confirm')" class="db-dialog" v-model:visible="deleteDatabaseDialog" >
            <InlineMessage severity="error" class="mb-3 w-full">
                {{ $t('home.drop_database_confirm_message', {database: $route.params.database}) }}
            </InlineMessage>

            <template #footer>
                <Button :label="$t('general.cancel')" @click="deleteDatabaseDialog = false" class="p-button-text p-button-plain" />
                <Button :label="$t('general.delete')" @click="DeleteDatabaseDoubleCheck" class="p-button-danger" />
            </template>
        </Dialog>

        <Dialog :header="$t('home.sql_editor')" v-model:visible="SqlEditorDialog" :draggable="false" :modal="true">
            <SqlEditor :database="database" />
        </Dialog>
    </div>
</template>

<style>
.create-table-modal {
    width: 650px;
    max-width: 95vw;
}
</style>