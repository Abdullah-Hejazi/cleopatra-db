<script>
export default {
    name: 'TableData',

    methods: {
        SortColumn(e) {
            this.sort(e)
        },

        EditRow(row) {
            this.editRow(row)
        },

        EditCell(cell) {
            if (this.hasKey) {
                this.editCell(cell)
            }
        },

        DeleteRow(row) {
            if (this.selectedRows.length > 0) {
                this.deleteRow(this.selectedRows)
                return;
            }

            this.deleteRow([row])
        },

        onRowContextMenu(event) {
            if (! this.hasKey) return;

            this.$refs.rowMenu.show(event.originalEvent);
        },

        DuplicateRow(row) {
            this.duplicateRow(row)
        },
    },

    props : [
        'columns',
        'data',
        'sort',
        'error',
        'sortField',
        'sortOrder',
        'hasKey',
        'editRow',
        'duplicateRow',
        'deleteRow',
        'editCell'
    ],

    data () {
        return {
            selectedRows: [],
            selectedRow: null,
            menuModel: [
                {
                    label: 'Edit',
                    icon: 'pi pi-fw pi-pencil',
                    visible: this.hasKey,
                    command: () => this.EditRow(this.selectedRow)
                },
                {
                    label: 'Duplicate',
                    icon: 'pi pi-fw pi-copy',
                    command: () => this.DuplicateRow(this.selectedRow)
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-fw pi-times',
                    visible: this.hasKey,
                    command: () => this.DeleteRow(this.selectedRow)
                }
            ]
        }
    },

    watch: {
        selectedRows: function(val) {
            this.menuModel[0].visible = this.hasKey && val.length < 2
            this.menuModel[1].visible = val.length < 2
        },

        hasKey: function(val) {
            this.menuModel[0].visible = this.hasKey && this.selectedRows.length < 2
            this.menuModel[2].visible = this.hasKey
        }
    }
}

</script>

<template>
    <div>
        <DataTable
            @rowContextmenu="onRowContextMenu"
            :resizableColumns="true"
            contextMenu
            v-model:contextMenuSelection="selectedRow"
            removableSort
            :sortField="sortField"
            :sortOrder="sortOrder"
            columnResizeMode="expand"
            :value="data"
            :lazy="true"
            :row-hover="true"
            v-model:selection="selectedRows"
            :showGridlines="true"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rows-per-page-options="[10,25,50]"
            responsive-layout="scroll"
            @sort="SortColumn"
        >
            <div class="text-center text-xl mb-4" v-if="error">
                <InlineMessage severity="error" class="w-full scalein select-text">
                    {{ error }}
                </InlineMessage>
            </div>

            <template #empty>
                <div class="text-xl" v-if="! error">
                    No rows found.
                </div>
            </template>

            <Column v-if="hasKey" selection-mode="multiple" header-style="width: 3rem" />

            <Column :sortable="true" v-for="(col, index) of columns" :field="col.Field" :header="col.Field" :key="index" style="width: 100px;">
                <template #body="slotProps">
                    <div class="row-data" v-on:dblclick="EditCell(slotProps)">
                        {{ slotProps.data[slotProps.field] }} &nbsp;
                    </div>
                </template>
            </Column>
        </DataTable>

        <ContextMenu :model="menuModel" ref="rowMenu" />
    </div>
</template>

<style>
.row-data {
    max-width: 250px;
    min-width: 40px;
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.p-datatable-responsive-scroll > .p-datatable-wrapper{
    overflow-x: unset !important;
}

</style>