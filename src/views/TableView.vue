<script>

import TableData from '@/components/TableData.vue'
import TableStructure from '@/components/TableStructure.vue'
import RowDialog from '@/components/RowDialog.vue'
import CellDialog from '@/components/CellDialog.vue'
import ExportDialog from '@/components/ExportDialog.vue'


export default {
    name: 'TableView',

    components: {
        TableData,
        TableStructure,
        RowDialog,
        CellDialog,
        ExportDialog
    },

    data() {
        return {
            items: [
                {
                    label: 'Table',
                    icon: 'pi pi-table',
                    command: () => {
                        this.activeIndex = 0
                        this.LoadTable()
                    }
                },
                {
                    label: 'Structure',
                    icon: 'pi pi-database',
                    command: () => {
                        this.activeIndex = 1
                        this.LoadTable()
                    }
                }
            ],

            menuItems: [
                {
                    label: 'Refresh Table',
                    icon: 'pi pi-refresh',
                    command: this.LoadTable
                },
                {
                    label: 'Insert Row',
                    icon: 'pi pi-plus',
                    command: () => this.newRow.active = true
                },
                {
                    label: 'Search',
                    icon: 'pi pi-search',
                    command: () => this.search.active = true
                },
                {
                    separator: true
                },
                {
                    label: this.$t('export.export'),
                    icon: 'pi pi-download',
                    command: () => this.exportDialog = true
                },
                {
                    label: 'Drop Table',
                    icon: 'pi pi-trash',
                    command: this.DropTableConfirmation
                }
            ],

            activeIndex: 0,
            pagination: {
                page: 0,
                perPage: 25,
                total: 0
            },

            data: [],
            columns: [],
            sort: null,
            error: '',
            search: {
                active: false,
                value: '',
                field: null,
                searching: false,
                operator: 'LIKE'
            },
            searchOperators: [
                'LIKE',
                '=',
                '!=',
                '<',
                '>',
                '<=',
                '>=',
                'IN'
            ],
            newRow: {
                active: false,
                error: ''
            },
            editRow: {
                active: false,
                data: null,
                error: ''
            },
            duplicateRow: {
                active: false,
                data: null,
                error: ''
            },
            editCell: {
                active: false,
                error: '',
                data: null
            },
            moreOptions: {
                active: false,
                label: 'More Options',
                icon: 'pi pi-angle-down'
            },
            tableStructure: [],
            tableKey: '',
            exportDialog: false
        }
    },

    props: [
        'table',
        'deleteTable'
    ],

    methods : {
        PageChange() {
            this.LoadTable()
        },

        SortChange(e) {
            if (e.sortOrder === 1) {
                this.sort = {
                    field: e.sortField,
                    order: 'ASC'
                }
            } else if (e.sortOrder === -1) {
                this.sort = {
                    field: e.sortField,
                    order: 'DESC'
                }
            } else {
                this.sort = null
            }

            this.LoadTable()
        },

        async LoadTable () {
            let form = {
                database: this.$route.params.database,
                table: this.table,
                page: this.pagination.page,
                perPage: this.pagination.perPage,
                sort: this.sort
            }

            if (this.search.searching) {
                form.search = this.search
            }

            this.$loading.show()

            this.data = []
            this.columns = []

            this.$store.dispatch('database/loadTable', form).then(result => {
                if (result.success) {
                    this.data = result.data[0]
                    this.columns = result.data[2]
                    this.pagination.total = result.data[1][0].count || 0
                    this.tableStructure = result.data[0][2]
                    this.LoadTableKey()
                } else {
                    this.error = result.error
                }
            }).finally(() => {
                this.$loading.hide()
            })
        },

        LoadTableKey () {
            this.tableKey = '';

            this.tableStructure.forEach(column => {
                if (column.Key === 'PRI' || column.Key === 'UNI') {
                    this.tableKey = column.Field
                    return;
                }
            })
        },

        Search() {
            if (! this.search.value || ! this.search.field?.name) {
                this.search.error = 'Search value and field are required !'
                return
            }

            this.search.searching = true
            this.pagination.page = 0
            this.sort = null
            this.LoadTable()
            this.search.active = false
        },

        ClearSearch() {
            this.search.searching = false
            this.search.value = ''
            this.LoadTable()
        },

        OpenTableMenu(event) {
            this.$refs.tableMenu.toggle(event)
        },

        DropTableEnd() {
            this.deleteTable()
        },

        async DropTable() {
            this.$loading.show()

            await this.$store.dispatch('database/dropTable', {
                database: this.$route.params.database,
                table: this.table
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Table deleted',
                        detail:'Table has been deleted successfully',
                        life: 3000
                    });
                } else {
                    this.error = result.error
                }

            }).finally(() => {
                this.DropTableEnd()
                this.$loading.hide()
            })
        },

        DropTableConfirmation() {
            this.$confirm.require({
                message: 'Are you sure you want to drop this table ?',
                header: 'Delete the table ?',
                icon: 'pi pi-exclamation-triangle',
                accept: this.DropTable
            });
        },

        MoreOptions() {
            if (this.moreOptions.active) {
                this.moreOptions.active = false
                this.moreOptions.icon = 'pi pi-angle-down'
                this.moreOptions.label = 'More Options'
            } else {
                this.moreOptions.active = true
                this.moreOptions.icon = 'pi pi-angle-up'
                this.moreOptions.label = 'Less Options'
            }
        },

        async InsertRow(row) {
            this.$loading.show()
            this.newRow.error = ''

            await this.$store.dispatch('database/insertRow', {
                database: this.$route.params.database,
                table: this.table,
                row: row
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Row inserted',
                        detail:'Row has been inserted successfully',
                        life: 3000
                    });
                    this.newRow.active = false
                } else {
                    this.newRow.error = result.error
                }
            }).finally(() => {
                this.LoadTable()
                this.$loading.hide()
            })
        },

        async DuplicateRowExecute(row) {
            this.$loading.show()
            this.duplicateRow.error = ''

            await this.$store.dispatch('database/insertRow', {
                database: this.$route.params.database,
                table: this.table,
                row: row
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Row duplicated',
                        detail:'Row has been duplicated successfully',
                        life: 3000
                    });
                    this.duplicateRow.active = false
                } else {
                    this.duplicateRow.error = result.error
                }
            }).finally(() => {
                this.LoadTable()
                this.$loading.hide()
            })
        },

        EditRow(row) {
            this.editRow.data = row;
            this.editRow.error = '';
            this.editRow.active = true;
        },

        DuplicateRow(row) {
            this.duplicateRow.data = row;
            this.duplicateRow.error = '';
            this.duplicateRow.active = true;
        },

        async UpdateRow(row, original) {
            this.$loading.show()
            this.editRow.error = ''

            await this.$store.dispatch('database/updateRow', {
                database: this.$route.params.database,
                table: this.table,
                row: row,
                original: original,
                key: this.tableKey
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Row updated',
                        detail:'Row has been updated successfully',
                        life: 3000
                    });

                    this.editRow.active = false
                } else {
                    this.editRow.error = result.error
                }
            }).finally(() => {
                this.LoadTable()
                this.$loading.hide()
            })
        },

        async DeleteRow(row) {
            let rows = row.map(r => r[this.tableKey])

            this.$loading.show()

            await this.$store.dispatch('database/deleteRows', {
                database: this.$route.params.database,
                table: this.table,
                key: this.tableKey,
                values: rows
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Row deleted',
                        detail:'Rows have been deleted successfully',
                        life: 3000
                    });
                } else {
                    this.error = result.error
                }
            }).finally(() => {
                this.LoadTable()
                this.$loading.hide()
            })
        },

        EditCell(cell) {
            this.editCell.active = true;
            this.editCell.data = cell
        },

        async UpdateCell(column, newValue) {
            this.$loading.show()
            this.editCell.error = ''

            await this.$store.dispatch('database/updateRow', {
                database: this.$route.params.database,
                table: this.table,
                row: {
                    [column]: newValue
                },
                original: this.editCell.data.data,
                key: this.tableKey
            }).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Row updated',
                        detail:'Row has been updated successfully',
                        life: 3000
                    });

                    this.editCell.active = false
                } else {
                    this.editCell.error = result.error
                }
            }).finally(() => {
                this.LoadTable()
                this.$loading.hide()
            })
        }
    },

    mounted () {
        this.LoadTable()
    },

    computed: {
        rowOptions() {
            let options = [10, 25, 50, 100]

            if (this.pagination.total > 100) {
                options.push(this.pagination.total)
            }

            return options
        },

        sortOrder() {
            if (this.sort) {
                if (this.sort.order === 'ASC') {
                    return 1
                } else if (this.sort.order === 'DESC') {
                    return -1
                }
            }

            return 0
        }
    },

    watch : {
        table: function () {
            this.pagination.total = 0
            this.pagination.page = 0
            this.search.value = ''
            this.search.field = null
            this.search.searching = false
            this.sort = null
            
            this.LoadTable()

        }
    },
}
</script>

<template>
    <div>
        <Panel>
            <template #header>
                <TabMenu :model="items" :activeIndex="activeIndex" />
            </template>

            <template #icons>
                <Button class="p-button-text p-button-rounded p-0" icon="pi pi-cog" @click="OpenTableMenu"  />
                <Menu ref="tableMenu" :model="menuItems" :popup="true" />
                <Button
                    @click="ClearSearch"
                    v-if="search.searching"
                    label="Clear Search"
                    class="p-button-text p-button-rounded"
                    icon="pi pi-times"
                />
            </template>

            <ScrollPanel class="w-full scroll-menu2">
                <TableData
                    :editCell="EditCell"
                    :hasKey="tableKey !== ''"
                    :editRow="EditRow"
                    :deleteRow="DeleteRow"
                    :duplicateRow="DuplicateRow"
                    :sortOrder="sortOrder"
                    :sortField="sort?.field"
                    :error="error"
                    :data="data"
                    :sort="SortChange"
                    :columns="columns"
                    v-if="activeIndex == 0"
                />

                <TableStructure :data="tableStructure" v-if="activeIndex == 1" />
            </ScrollPanel>

            <Paginator
                v-if="activeIndex == 0"
                v-model:first="pagination.page"
                :rows="pagination.perPage"
                :totalRecords="pagination.total"
                :rowsPerPageOptions="rowOptions"
                v-model:rows="pagination.perPage"
                @page="PageChange"
                :pageLinkSize="3"
            />
        </Panel>

        <!-- Dialogs -->
        <!-- Search Dialog -->
        <Dialog header="Search" v-model:visible="search.active" class="search-dialog" :modal="true">

            <div class="text-center text-xl mb-4" v-if="search.error">
                <InlineMessage severity="error" class="w-full scalein select-text">
                    {{ search.error }}
                </InlineMessage>
            </div>

            <div class="md:flex grid-nogutter">
                <div class="col-12 md:col-7 md:mb-3 px-1">
                    <InputText v-model="search.value" placeholder="Search" class="w-full" />
                </div>
                <div class="col-12 md:col-5 px-1">
                    <Dropdown v-model="search.field" :options="columns" optionLabel="name" placeholder="Field" class="w-full" />
                </div>
            </div>

            <div class="my-3" v-if="moreOptions.active">
                <p class="my-1">Operator</p>
                <Dropdown v-model="search.operator" :options="searchOperators" placeholder="Operator" class="w-full" />
            </div>

            <div class="text-center mb-3">
                <Button label="Search" class="w-full" icon="pi pi-search" @click="Search" />
            </div>

            <div class="text-center mt-2 mb-0">
                <Button class="p-button-text p-button-plain" :icon="moreOptions.icon" :label="moreOptions.label" @click="MoreOptions" />
            </div>
        </Dialog>

        <Dialog header="Insert New Row" v-model:visible="newRow.active" class="add-row-dialog" :modal="true">
            <RowDialog button="Insert Row" :error="newRow.error" :tableStructure="tableStructure" :finish="InsertRow" />
        </Dialog>

        <Dialog header="Edit Row" v-model:visible="editRow.active" class="add-row-dialog" :modal="true">
            <RowDialog button="Edit Row" :row="editRow.data" :error="editRow.error" :tableStructure="tableStructure" :finish="UpdateRow" />
        </Dialog>

        <Dialog header="Duplicate Row" v-model:visible="duplicateRow.active" class="add-row-dialog" :modal="true">
            <RowDialog button="Duplicate Row" :row="duplicateRow.data" :error="duplicateRow.error" :tableStructure="tableStructure" :finish="DuplicateRowExecute" />
        </Dialog>

        <Dialog :header="'Edit ' + editCell?.data?.field" v-model:visible="editCell.active" class="add-row-dialog" :modal="true">
            <CellDialog :finish="UpdateCell" :tableKey="tableKey" :data="editCell.data" :error="editCell.error" :tableStructure="tableStructure" />
        </Dialog>
        
        <ExportDialog :title="$t('export.export_table')" :database="$route.params.database" :table="table" :visible="exportDialog" @visibilityChange="val => exportDialog = val" />
    </div>
</template>

<style>
.p-panel-content {
    padding: 0 !important;
}

.p-scrollpanel-content {
    padding: 10px !important;
    padding-bottom: 15px !important;
}

.p-paginator {
    justify-content: center !important;
}

.search-dialog {
    width: 400px;
    max-width: 100vw;
}

.add-row-dialog {
    width: 450px;
    max-width: 100vw;
    max-height: 80vh;
}
</style>