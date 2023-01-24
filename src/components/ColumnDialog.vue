<script>
export default {
    name: 'ColumnDialog',

    data() {
        return {
            name: '',
            type: '',
            size: null,
            precision: null,
            values: '',
            index: null,
            isNull: false,
            autoIncrement: false,
            defaultValue: '',

            defaultTypes: [
                {
                    label: 'As Defined'
                },
                {
                    label: 'NULL'
                },
                {
                    label: 'CURRENT_TIMESTAMP'
                },
            ],
            defaultType: {},

            types: [
                {
                    label: 'Popular',
                    icon: 'pi-star',
                    items: [
                        {
                            label: 'INT'
                        },
                        {
                            label: 'VARCHAR',
                            size: true
                        },
                        {
                            label: 'TEXT'
                        },
                        {
                            label: 'TIMESTAMP'
                        }
                    ]
                },
                {
                    label: 'Strings',
                    icon: 'pi-align-left',
                    items: [
                        {
                            label: "CHAR",
                            size: true
                        },
                        {
                            label: "VARCHAR",
                            size: true
                        },
                        {
                            label: "BINARY",
                            size: true
                        },
                        {
                            label: "VARBINARY",
                            size: true
                        },
                        {
                            label: "TINYBLOB"
                        },
                        {
                            label: "TINYTEXT"
                        },
                        {
                            label: "TEXT"
                        },
                        {
                            label: "BLOB"
                        },
                        {
                            label: "MEDIUMTEXT"
                        },
                        {
                            label: "MEDIUMBLOB"
                        },
                        {
                            label: "LONGTEXT"
                        },
                        {
                            label: "LONGBLOB"
                        },
                        {
                            label: "ENUM",
                            values: true
                        },
                        {
                            label: "SET",
                            values: true
                        },
                        {
                            label: 'JSON'
                        }
                    ]
                },
                {
                    label: 'Numbers',
                    icon: 'pi-sort-numeric-up-alt',
                    items: [
                        {
                            label: "BIT"
                        },
                        {
                            label: "TINYINT"
                        },
                        {
                            label: "BOOL"
                        },
                        {
                            label: "BOOLEAN"
                        },
                        {
                            label: "SMALLINT"
                        },
                        {
                            label: "MEDIUMINT"
                        },
                        {
                            label: "INT"
                        },
                        {
                            label: "INTEGER"
                        },
                        {
                            label: "BIGINT"
                        },
                        {
                            label: "FLOAT",
                            size: true
                        },
                        {
                            label: "DOUBLE"
                        },
                        {
                            label: "DOUBLE PRECISION"
                        },
                        {
                            label: "DECIMAL",
                            size: true,
                            precision: true
                        },
                        {
                            label: "NUMERIC",
                            size: true,
                            precision: true
                        }
                    ]
                },
                {
                    label: 'Dates & Times',
                    icon: 'pi-calendar',
                    items: [
                        {
                            label: "DATE"
                        },
                        {
                            label: "DATETIME"
                        },
                        {
                            label: "TIMESTAMP"
                        },
                        {
                            label: "TIME"
                        },
                        {
                            label: "YEAR"
                        }
                    ]
                }
            ],

            indexTypes: [
                {
                    label: 'PRIMARY KEY'
                },
                {
                    label: 'UNIQUE'
                },
                {
                    label: 'INDEX'
                },
                {
                    label: 'FULLTEXT'
                }
            ],

            moreOptions: {
                active: false,
                label: 'More Options',
                icon: 'pi pi-angle-down'
            },

            error: ''
        }
    },

    props: [
        'finish',
        'column',
        'label',
        'id'
    ],

    mounted() {
        this.type = this.types[0].items[0]

        if (this.column) {
            this.name = this.column.name
            this.type = this.column.type
            this.size = this.column.size
            this.index = this.column.index
            this.isNull = this.column.isNull
            this.autoIncrement = this.column.autoIncrement
            this.defaultType = this.column.defaultType
            this.defaultValue = this.column.defaultValue
            this.precision = this.column.precision
            this.values = this.column.values
        }
    },

    methods: {
        NullableConstraint() {
            if (this.isNull) {
                this.autoIncrement = false
            }
        },

        AutoIncrementConstraint() {
            if (this.autoIncrement) {
                this.isNull = false

                if (this.index?.label !== 'UNIQUE') {
                    this.index = this.indexTypes[0]
                }
            }
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

        FinishColumn () {
            if (this.name === '') {
                this.error = 'Column name is required'
                return
            }

            let data = {
                name: this.name,
                type: this.type,
                size: this.size,
                isNull: this.isNull,
                autoIncrement: this.autoIncrement,
                defaultValue: this.defaultValue,
                defaultType: this.defaultType,
                index: this.index,
                precision: this.precision,
                values: this.values
            }

            if (this.id == -1) {
                this.finish(data)
            } else {
                this.finish(data, this.id)
            }
        }
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

        <div>
            <p class="m-0 mb-2 pl-1">Column Name</p>
            <InputText placeholder="Column Name" class="w-full" v-model="name" />
        </div>

        <div>
            <p class="m-0 my-2">Column Type</p>
            <Dropdown v-model="type" :options="types" option-label="label" :filter="true" placeholder="Type"
                optionGroupLabel="label" optionGroupChildren="items" class="w-full">
                <template #optiongroup="slotProps">
                    <div class="flex align-items-center country-item pl-0">
                        <span :class="'pi mr-2 ' + slotProps.option.icon"></span>
                        <div>{{ slotProps.option.label }}</div>
                    </div>
                </template>
            </Dropdown>
        </div>

        <div class="mt-3 flex justify-content-between">
            <div class="field-checkbox">
                <Checkbox v-model="isNull" :binary="true" @change="NullableConstraint" />
                <label>Nullable</label>
            </div>

            <div class="field-checkbox">
                <Checkbox v-model="autoIncrement" :binary="true" @change="AutoIncrementConstraint" />
                <label>Auto Increment</label>
            </div>
        </div>

        <Divider />

        <div v-if="moreOptions.active">
            <div v-if="type.values">
                <div class="p-0 my-2">
                    <p class="m-0">Enum/Set Values</p>
                    <small class="text-500 my-1">Add values like this ( value1, value2,...)</small>
                    <InputText placeholder="Values" class="w-full" v-model="values" />
                </div>
            </div>

            <div v-if="type.size">
                <div class="p-0 my-2">
                    <p class="m-0 mb-2">Column Type Size</p>
                    <InputNumber :use-grouping="false" placeholder="Size" class="w-full" v-model="size" />
                </div>
            </div>

            <div v-if="type.precision">
                <div class="p-0 my-2">
                    <p class="m-0 mb-2">Column Type Precision</p>
                    <InputNumber :use-grouping="false" placeholder="Size" class="w-full" v-model="precision" />
                </div>
            </div>

            <div>
                <div class="p-0 my-2">
                    <p class="m-0 mb-2">Index</p>
                    <Dropdown v-model="index" :options="indexTypes" option-label="label" placeholder="Type" class="w-full" />
                </div>
            </div>

            <div>
                <p class="mb-2 pl-1">Default Value</p>
                <Dropdown v-model="defaultType" :options="defaultTypes" optionLabel="label" placeholder="Type"
                    class="w-full" />

                <div class="mt-2 w-full" v-if="defaultType.label == 'As Defined'">
                    <InputText placeholder="Default value" class="w-full" v-model="defaultValue" />
                </div>
            </div>
        </div>

        <div class="mt-3 flex justify-content-between">
            <Button class="p-button-text p-button-plain" :icon="moreOptions.icon" :label="moreOptions.label" @click="MoreOptions" />

            <Button :label="label" @click="FinishColumn" />
        </div>

    </div>
</template>
