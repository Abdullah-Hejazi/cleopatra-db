<script>

import ColumnDialog from '@/components/ColumnDialog.vue'

export default {
    name: 'CreateTableDialog',

    components: {
        ColumnDialog
    },

    props: [
        'finish',
        'engines'
    ],

    data () {
        return {
            table: {
                name: '',
                engine: null,
                collation: null
            },

            tableColumns: [
                {
                    field: 'name',
                    header: 'Name'
                },
                {
                    field: 'type.label',
                    header: 'Type'
                }
            ],

            columns: [],

            columnDialog: {
                active: false,
                header: 'New Column',
                button: 'Add Column',
                column: null,
                func: null,
                id: -1
            },

            moreOptions: {
                active: false,
                label: 'More Options',
                icon: 'pi pi-angle-down'
            },

            error: ''
        }
    },

    methods: {
        AddColumnDialog () {
            this.columnDialog.id = -1
            this.columnDialog.header = 'New Column'
            this.columnDialog.button = 'Add Column'
            this.columnDialog.column = null
            this.columnDialog.func = this.AddColumn
            this.columnDialog.active = true

        },

        EditColumnDialog (index) {
            this.columnDialog.id = index
            this.columnDialog.header = 'Edit Column'
            this.columnDialog.button = 'Edit Column'
            this.columnDialog.column = this.columns[index]
            this.columnDialog.func = this.EditColumn
            this.columnDialog.active = true
        },

        RemoveColumn (index) {
            this.columns.splice(index, 1)

            this.CheckColumnConstraint()
        },

        AddColumn (column) {
            this.error = ''

            this.columns.push(column)
            this.columnDialog.active = false

            this.CheckColumnConstraint()
        },

        CheckColumnConstraint() {
            let primary = 0;

            let names = []

            for(let i = 0; i < this.columns.length; i++) {
                if (names.includes(this.columns[i].name)) {
                    this.error = 'Column names must be unique'
                    return
                }

                names.push(this.columns[i].name)

                if(this.columns[i].index?.label == 'PRIMARY KEY') {
                    primary++;
                }
            }

            if(primary > 1) {
                this.error = 'You can only have one primary key (AutoIncrement sets the index to primary key !)'
            } else {
                this.error = ''
            }
        },

        EditColumn (column, id) {
            this.columns[id] = column
            this.columnDialog.active = false

            this.CheckColumnConstraint()
        },

        onRowReorder (e) {
            let temp = this.columns[e.dragIndex]

            this.columns[e.dragIndex] = this.columns[e.dropIndex]
            this.columns[e.dropIndex] = temp
        },

        async CreateTable () {
            if (this.table.name == '') {
                this.error = 'Table name is required'
                return;
            }

            if (this.columns.length == 0) {
                this.error = 'Table must have at least one column'
                return;
            }

            let form = {};

            form.tableName = this.table.name
            form.engine = this.table.engine
            form.collation = this.table.collation
            form.databaseName = this.$route.params.database
            form.columns = JSON.parse(JSON.stringify(this.columns))
            
            form.columns.map(column => {
                column.defaultValue = this.GetDefaultValue(column.defaultType, column.defaultValue)
                column.index = column.index?.label
                delete column.defaultType
                return column
            })

            this.$loading.show()

            await this.$store.dispatch('database/createTable', form).then(result => {
                if (result.success) {
                    this.$toast.add({
                        severity:'success',
                        summary: 'Table created',
                        detail:'Table created successfully',
                        life: 3000
                    });

                    this.finish()
                } else {
                    this.error = result.error
                }
            }).catch(error => {
                this.error = error.message
            }).finally(() => {
                this.$loading.hide()
            })
        },

        GetDefaultValue(type, val) {
            if (type?.label == 'As Defined') {
                return val
            }

            if (! type ) return '';

            return type.label
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
    }
}
</script>

<template>
    <div>
        <Divider class="mt-0" />

        <div v-if="error" class="my-2">
            <InlineMessage severity="error" class="w-full scalein select-text">
                {{ error }}
            </InlineMessage>
        </div>

        <InputText placeholder="Table Name" class="w-full mt-1" v-model="table.name" @input="error = ''" />

        <div class="flex justify-content-between align-items-center mt-3">
            <h3>Columns</h3>
            <div>
                <Button
                    class="p-button-outlined"
                    icon="pi pi-plus"
                    label="Add Column"
                    @click="AddColumnDialog"
                />
            </div>
        </div>

        <DataTable :value="columns" @rowReorder="onRowReorder" responsiveLayout="scroll" :rowHover="true">
            <Column :rowReorder="true" headerStyle="width: 3rem" :reorderableColumn="false" />

            <Column v-for="col of tableColumns" :field="col.field" :header="col.header" :key="col.field"></Column>

            <Column header="Index">
                <template #body="{data}">
                    <span class="pi pi-key text-primary" v-tooltip="'Primary Key'" v-if="data.index?.label == 'PRIMARY KEY'"></span>
                    <span class="pi pi-book text-primary" v-tooltip="'Index'" v-if="data.index?.label == 'INDEX'"></span>
                    <span class="pi pi-database text-primary" v-tooltip="'Unique'" v-if="data.index?.label == 'UNIQUE'"></span>
                    <span class="pi pi-align-justify text-primary" v-tooltip="'Full Text'" v-if="data.index?.label == 'FULLTEXT'"></span>
                </template>
            </Column>

            <Column field="isNull" header="Null">
                <template #body="{data}">
                    <span class="pi pi-check text-primary" v-if="data.isNull"></span>
                    <span class="pi pi-times text-500" v-else></span>
                </template>
            </Column>

            <Column field="autoIncrement" header="A.I">
                <template #body="{data}">
                    <span class="pi pi-check text-primary" v-if="data.autoIncrement"></span>
                    <span class="pi pi-times text-500" v-else></span>
                </template>
            </Column>

            <Column header="Options">
                <template #body="{index}">
                    <Button class="p-button-text p-button-rounded" icon="pi pi-pencil" @click="EditColumnDialog(index)" />
                    <Button class="p-button-text p-button-rounded p-button-danger" icon="pi pi-trash" @click="RemoveColumn(index)" />
                </template>
            </Column>

            <template #empty>
                <div class="text-center">
                    <h4 class="m-0">
                        No columns found
                        <span class="text-primary cursor-pointer" @click="AddColumnDialog"> Add Column </span>
                    </h4>
                </div>
            </template>
        </DataTable>

        <div class="flex justify-content-center align-items-center mt-5" v-if="moreOptions.active">
            <Dropdown
                v-model="table.engine"
                :options="engines"
                optionLabel="Engine"
                placeholder="Storage Engine [Default]"
                class="col-6 mx-2"
            />

            <Dropdown
                v-model="table.collation"
                :options="$store.state.database.collations"
                optionLabel="COLLATION_NAME"
                placeholder="Collation [Default]"
                class="col-6 mx-2"
            />
        </div>

        <div class="text-center mt-4">
            <Button @click="CreateTable" label="Create Table" style="width: 300px; max-width: 100%;" />
        </div>

        <div class="text-center mt-2">
            <Button class="p-button-text p-button-plain" :icon="moreOptions.icon" :label="moreOptions.label" @click="MoreOptions" />
        </div>

        <Dialog class="column-dialog" :modal="true" v-model:visible="columnDialog.active" :header="columnDialog.header">
            <ColumnDialog :id="columnDialog.id" :column="columnDialog.column" :finish="columnDialog.func" :label="columnDialog.button" />
        </Dialog>
    </div>
</template>

<style>
.column-dialog {
    width: 500px;
    max-width: 95vw;
}
</style>