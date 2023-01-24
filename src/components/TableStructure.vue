<script>
import QueryBuilder from '@/services/querybuilder';

export default {
    name: 'TableStructure',

    props: [
        'data'
    ]
}
</script>

<template>
    <div>
        <DataTable
            :resizableColumns="true"
            columnResizeMode="expand"
            :stripedRows="true"
            :value="data"
            :lazy="true"
            :row-hover="true"
            responsive-layout="scroll"
        >
            <template #empty>
                <div class="text-xl">
                    No data found.
                </div>
            </template>

            <Column field="Field" header="Name" />

            <Column field="Type" header="Type">
                <template #body="{data}">
                    <div class="table-structure-type" v-tooltip.bottom="data.Type">
                        {{ data.Type }}
                    </div>
                </template>
            </Column>

            <Column field="Null" header="Null">
                <template #body="{data}">
                    <span class="pi pi-check text-primary" v-if="data.Null === 'YES'"></span>
                    <span class="pi pi-times" v-else></span>
                </template>
            </Column>

            <Column field="Key" header="Key">
                <template #body="{data}">
                    <span class="pi pi-key text-primary" v-if="data.Key === 'PRI'" v-tooltip.bottom="'PRIMARY KEY'"></span>
                    <span class="pi pi-database text-primary" v-if="data.Key === 'UNI'" v-tooltip.bottom="'UNIQUE'"></span>
                    <span class="pi pi-book text-primary" v-if="data.Key === 'MUL'" v-tooltip.bottom="'INDEX'"></span>
                </template>
            </Column>

            <Column field="Default" header="Default" />
            
            <Column field="Extra" header="Extra" class="uppercase" />
        </DataTable>
    </div>
</template>

<style scoped>
    .table-structure-type {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 130px;
    }
</style>