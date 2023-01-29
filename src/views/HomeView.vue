<script>
import DatabaseItem from '@/components/DatabaseItem.vue';
import SqlEditor from '@/components/SqlEditor.vue';
import DatabaseManager from '@/services/databasemanager';

export default {
    name: 'HomeView',

    components: {
        DatabaseItem,
        SqlEditor
    },

    data() {
        return {
            newDatabase: {
                name: '',
                collation: this.$store.state.database.collations[122],
            },

            newDBError: '',
            error: '',

            createDatabaseDialog: false,

            SqlEditorDialog: false
        }
    },

    mounted () {
        this.RefreshDatabase()
    },

    methods: {
        async CreateDatabase() {
            this.$loading.show()

            DatabaseManager.createDatabase(
                this.newDatabase.name,
                this.newDatabase.collation.CHARACTER_SET_NAME,
                this.newDatabase.collation.COLLATION_NAME
            ).then((result) => {
                if (result.success) {
                    this.newDatabase.name = '';
                    this.createDatabaseDialog = false;
                    this.$toast.add({
                        severity:'success',
                        summary: this.$t('home.database_created'),
                        detail: this.$t('home.database_created_message'),
                        life: 3000
                    });

                    this.createDatabaseDialog = false;

                    this.RefreshDatabase()
                } else {
                    this.newDBError = result.error;
                }
            }).finally(() => {
                this.$loading.hide()
            })
        },

        async RefreshDatabase() {
            this.error = ''
            this.$loading.show()

            let result = await this.$store.dispatch('database/refreshDatabases')
            
            if (!result.success) {
                this.error = result.error
            }

            this.$loading.hide()
        }
    }
}

</script>

<template>
    <div class="databases">
        <div class="text-center text-2xl my-3">
            <div>{{ $t('home.databases') }}</div>
            <div class="flex justify-content-center align-items-center mt-1">
                <Button
                    icon="pi pi-plus"
                    :label="$t('home.create_database')"
                    class="ml-3 p-button-text p-button-primary"
                    @click="createDatabaseDialog = true"
                />
                <Button
                    icon="pi pi-refresh"
                    :label="$t('home.refresh_databases')"
                    class="p-button-text p-button-secondary"
                    @click="RefreshDatabase"
                />

                <Button
                    icon="pi pi-hashtag"
                    :label="$t('home.sql_editor')"
                    class="p-button-text p-button-primary"
                    @click="SqlEditorDialog = true"
                />
            </div>
        </div>

        <div v-if="error" class="mx-5">
            <InlineMessage severity="error" class="w-full scalein select-text">
                {{ error }}
            </InlineMessage>
        </div>

        <div class="flex flex-wrap justify-content-center mt-5">
            <DatabaseItem
                class="mx-3"
                v-for="(database, index) in $store.state.database.databases"
                :key="index"
                :index="index"
                :database="database"
            />
        </div>

        <Dialog :header="$t('home.create_new_database')" :modal="true" v-model:visible="createDatabaseDialog" class="display-name-dialog text-sm">
            <InlineMessage severity="error" v-if="newDBError" class="mb-3 w-full scalein">
                {{ newDBError }}
            </InlineMessage>
            
            <div>
                <InputText :placeholder="$t('home.database_name')" v-model="newDatabase.name" class="w-full mt-3" />

                <Dropdown
                    class="w-full mt-3"
                    v-model="newDatabase.collation"
                    :options="$store.state.database.collations"
                    optionLabel="COLLATION_NAME"
                    :placeholder="$t('home.select_collation')"
                    option-group-children="items"
                    :filter="true"
                />
            </div>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button
                        :label="$t('general.cancel')"
                        @click="createDatabaseDialog = false"
                        class="p-button-text"
                    />
                    <Button :label="$t('home.create_database')" @click="CreateDatabase" />
                </div>
            </template>
        </Dialog>

        <Dialog :header="$t('home.sql_editor')" v-model:visible="SqlEditorDialog" :draggable="false" :modal="true">
            <SqlEditor  />
        </Dialog>
    </div>
</template>

<style>
.display-name-dialog {
    width: 400px;
}
</style>