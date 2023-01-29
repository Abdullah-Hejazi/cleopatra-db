<script>
import Textarea from 'primevue/textarea';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import ScrollPanel from 'primevue/scrollpanel';

export default {
    name: 'SqlEditor',

    components: {
        Textarea,
        Accordion,
        AccordionTab,
        ScrollPanel
    },

    props: [
        'database'
    ],

    data () {
        return {
            query: '',
            data: [],
            columns: [],
            empty: false,
            error: '',
            usedDatabase: ''
        }
    },

    async mounted () {
        if (this.database) {
            let result = await this.$store.dispatch('database/executeQuery', 'USE `' + this.database + '`;')

            if (result.success) {
                this.usedDatabase = this.database
            }
        }
    },

    methods: {
        async ExecuteQuery () {
            this.error = ''
            this.$loading.show()

            this.clearData()

            let result = await this.$store.dispatch('database/executeQuery', this.query)

            this.$loading.hide()

            if (! result.success) {
                this.error = result.error
                return
            }

            if (result.data.length > 0) {
                for(let item in result.data[0]) {
                    this.columns.push(item)
                }

                this.data = result.data
            } else {
                this.clearData()
                this.empty = true
            }
        },

        clearData () {
            this.data = []
            this.columns = []
            this.empty = false
        }
    }
}
</script>

<template>
    <div class="sql-editor-dialog">
        <Accordion :multiple="true" :activeIndex="[0]">
            <AccordionTab :header="$t('home.query') + (usedDatabase ? ' - ' + usedDatabase : '')">
                <div v-if="error" class="my-3">
                    <InlineMessage severity="error" class="w-full scalein select-text">
                        {{ error }}
                    </InlineMessage>
                </div>

                <Textarea :placeholder="$t('home.enter_query')" v-model="query" class="w-full" rows="5" :autoResize="false" />

                <div class="text-sm my-1 text-gray-500 ml-2">
                    {{  $t('home.first_query_results_only') }}
                </div>
            </AccordionTab>
            <AccordionTab :header="$t('home.result') + ' - ' + data.length  + ' ' + $t('home.rows')" :disabled="data.length === 0 && !empty" v-if="data.length > 0 || empty">
                <div v-if="empty">
                    <div class="text-center">
                        <span class="text-md">{{ $t('home.no_results') }}</span>
                    </div>
                </div>
                
                <div v-else style="overflow: auto">
                    <DataTable :value="data" showGridlines responsiveLayout="scroll">
                        <Column v-for="column in columns" :field="column" :header="column"></Column>
                    </DataTable>
                </div>
            </AccordionTab>
        </Accordion>

        <div class="flex justify-content-center mt-4">
            <Button @click="ExecuteQuery" :label="$t('home.execute')" class="p-button-primary" style="width: 200px; max-width: 100%;" />
        </div>
    </div>
</template>

<style>
.sql-editor-dialog {
    width: 80vw;
}
</style>