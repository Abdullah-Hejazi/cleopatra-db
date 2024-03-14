<script>

export default {
    name: 'CellDialog',

    props: [
        'data',
        'error',
        'tableStructure',
        'tableKey',
        'finish'
    ],

    mounted () {
        this.tableStructure.forEach(column => {
            if (column.Field === this.data.field) {
                let t = column.Type;
                this.type = t

                if (column.Null == 'YES') {
                    this.nullable = true;
                }
            }
        })

        this.newValue = this.data.data[this.data.field]
    },

    data () {
        return {
            newValue: '',
            types: {
                texts: [
                    "TINYTEXT",
                    "TEXT",
                    "MEDIUMTEXT",
                    "LONGTEXT",
                    "BLOB",
                    "MEDIUMBLOB",
                    "LONGBLOB",
                    "TINYBLOB"
                ],
                numbers: [
                    "BIT",
                    "TINYINT",
                    "SMALLINT",
                    "MEDIUMINT",
                    "INT",
                    "INTEGER",
                    "BIGINT",
                    "YEAR"
                ],
                datetimes: [
                    "DATETIME",
                    "TIMESTAMP"
                ],
                dates: ["DATE"],
                times: ["TIME"],
                enums: ['ENUM', 'SET']
            },
            type: '',
            isNull: false,
            nullable: false
        }
    },

    methods: {
        Finish() {
            if (this.TypeExists(this.types.datetimes, this.type) || this.TypeExists(this.types.dates, this.type)) {
                let datetime = new Date(this.newValue);
                this.newValue = datetime.toISOString().slice(0, 19).replace('T', ' ');
            }

            if (this.nullable && this.isNull) {
                this.newValue = null;
            }

            this.finish(this.data.field, this.newValue)
        },

        TypeExists(haystack, needle) {
            needle = needle.toUpperCase();
    
            if (haystack.includes(needle)) {
                return true;
            }

            if (haystack.includes(needle.replace(/\(.*\)/, ''))) {
                return true;
            }

            return false;
        },

        GetEnumValues(type) {
            let matches = type.match(/\((.*)\)/);

            let result = matches[1].split(',').map(item => {
                let val = item.trim();

                return val.substring(1, val.length - 1);
            });
            return result;
        },
    }
}
</script>

<template>
    <div>
        <div v-if="error" class="my-2">
            <InlineMessage severity="error" class="w-full scalein select-text">
                {{ error }}
            </InlineMessage>
        </div>

        <p class="mb-1">{{ data.field }}</p>

        <div v-if="TypeExists(types.texts, type)">
            <Textarea :placeholder="data.field" v-model="newValue" :rows="2" class="w-full" />
        </div>

        <div v-else-if="TypeExists(types.numbers, type)">
            <InputNumber :placeholder="data.field" v-model="newValue" class="w-full" :format="false" />
        </div>

        <div v-else-if="TypeExists(types.datetimes, type)">
            <Calendar :placeholder="data.field" v-model="newValue" class="w-full" :showTime="true" hourFormat="12"/>
        </div>

        <div v-else-if="TypeExists(types.dates, type)">
            <Calendar :placeholder="data.field" v-model="newValue" class="w-full" />
        </div>

        <div v-else-if="TypeExists(types.times, type)">
            <Calendar :placeholder="data.field" v-model="newValue" class="w-full" :showTime="true" :timeOnly="true" />
        </div>

        <div v-else-if="TypeExists(types.enums, type)">
            <Dropdown :placeholder="data.field" v-model="newValue" class="w-full" :options="GetEnumValues(type)" />
        </div>

        <div v-else>
            <InputText :placeholder="data.field" v-model="newValue" class="w-full" />
        </div>

        <div v-if="nullable">
            <Checkbox @change="newValue = null" v-model="isNull" :binary="true" class="mr-2 mt-2" />
            <span>{{ $t('table.is_null') }}</span>
        </div>

        <div class="mt-5">
            <Button label="Edit" class="w-full" @click="Finish" />
        </div>
    </div>
</template>

<style>
.column-dialog {
    width: 500px;
    max-width: 95vw;
}
</style>