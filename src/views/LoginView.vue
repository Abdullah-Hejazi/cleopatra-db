<script>
import AccountItem from '@/components/AccountItem.vue'

export default {
    name: 'LoginView',

    components: {
        AccountItem
    },

    data() {
        return {
            loginData: {
                username: '',
                password: '',
                host: '',
                port: null,
                displayName: ''
            },
            moreOptions: {
                text: this.$t('general.moreOptions'),
                icon: 'pi pi-angle-down',
                active: false
            },
            error: '',
            displayNameDialog: false,
            savedAccounts: [],
            selectedAccount: false,
            selectedAccountIndex: 0,
            selectedAccountPassword: '',
            savePassword: false
        }
    },

    mounted () {
        let accounts = localStorage.getItem('savedAccounts')
        if (accounts) {
            this.savedAccounts = JSON.parse(accounts)
        }
    },

    methods: {
        async Login() {
            await this.PerformLogin(this.loginData)
        },

        async PerformLogin(data) {
            this.$loading.show()

            this.error = ''

            let result = await this.$store.dispatch('database/connect', data);

            this.$loading.hide()

            if (result === '') {
                this.$router.push('/databases')
                return
            }
            
            this.error = error
            this.$store.dispatch('database/clearConnection')
        },

        MoreOptions() {
            this.moreOptions.active = !this.moreOptions.active
            if (this.moreOptions.active) {
                this.moreOptions.icon = 'pi pi-angle-up'
                this.moreOptions.text = this.$t('general.lessOptions')
            } else {
                this.moreOptions.icon = 'pi pi-angle-down'
                this.moreOptions.text = this.$t('general.moreOptions')
            }
        },

        SaveAccount() {
            let data = {
                username: this.loginData.username,
                host: this.loginData.host == '' ? 'localhost' : this.loginData.host,
                port: this.loginData.port == null ? 3306 : this.loginData.port,
                displayName: this.loginData.displayName,
                savePassword: this.savePassword
            }

            if (this.savePassword) {
                data.password = this.loginData.password
            }

            this.savedAccounts.push(data)

            // settings.set('savedAccounts', {
            //     data: JSON.stringify(this.savedAccounts)
            // })
            localStorage.setItem('savedAccounts', JSON.stringify(this.savedAccounts))

            this.displayNameDialog = false
        },

        RemoveAccount(index) {
            this.savedAccounts.splice(index, 1);

            localStorage.setItem('savedAccounts', JSON.stringify(this.savedAccounts))
        },

        async LoadAccount() {
            this.selectedAccount = false

            let account = JSON.parse(JSON.stringify(this.savedAccounts[this.selectedAccountIndex]))
            
            if (! account.savePassword) {
                account.password = this.selectedAccountPassword
            }

            await this.PerformLogin(account)
        },

        async SelectAccount(index) {
            this.selectedAccountIndex = index
            this.selectedAccountPassword = ''

            if (this.savedAccounts[index].savePassword) {
                await this.LoadAccount()
            } else {
                this.selectedAccount = true
            }
        },
    },
}

</script>

<template>
    <div class="login">
        <div class="loginData-card loginData-margin mx-auto surface-card p-4 shadow-2 border-round">
            <div class="text-center mb-5">
                <img src="@/assets/logo2.png" alt="DB Weiv" width="50" class="mb-3">
                <div class="text-900 text-3xl font-medium mb-3">{{ $t('login.title') }}</div>
            </div>

            <InlineMessage severity="error" v-if="error" class="mb-3 w-full scalein">
                {{ error }}
            </InlineMessage>

            <div>
                <div class="col-12">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-user"></i>
                        </span>
                        <InputText :placeholder="$t('login.username')" v-model="loginData.username" />
                    </div>
                </div>

                <div class="col-12">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-lock"></i>
                        </span>
                        <Password :placeholder="$t('login.password')" v-model="loginData.password" toggle-mask :feedback="false" />
                    </div>
                </div>

                <div class="scalein" v-if="moreOptions.active">
                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-server"></i>
                            </span>
                            <InputText :placeholder="$t('login.host')" v-model="loginData.host"
                                v-tooltip.right="$t('login.defaultsTo') + ': localhost'" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-sort-alt"></i>
                            </span>
                            <InputNumber :placeholder="$t('login.port')" v-model="loginData.port" mode="decimal" :use-grouping="false"
                                v-tooltip.right="$t('login.defaultsTo') + ': 3306'" />
                        </div>
                    </div>
                </div>

                <div class="text-center mt-3">
                    <Button :label="$t('login.login')" class="login-button" @click="Login" />
                    
                    <div class="flex justify-content-between">
                        <Button
                            :label="$t('login.saveAccount')"
                            class="p-button-text p-button-plain"
                            @click="displayNameDialog = true"
                        />

                        <div class="p-text-secondary cursor-pointer" @click="MoreOptions">
                            <p class="text-small">
                                {{ moreOptions.text }}
                                <i :class="'pi ' + moreOptions.icon"></i>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="loginData-card mx-auto surface-card pt-3 shadow-2 border-round mt-3">
            <div class="text-center">
                <div class="text-600 text-2xl font-medium">{{ $t('login.savedAccounts') }}</div>
            </div>

            <div class="px-5">
                <Divider />
            </div>

            <div class="p-3">
                <AccountItem
                    v-for="(account, index) in savedAccounts"
                    :key="index"
                    :account="account"
                    :index="index"
                    :remove="RemoveAccount"
                    :load="SelectAccount"
                />

                <div class="text-center text-600 mb-3" v-if="savedAccounts.length == 0">
                    {{ $t('login.noSavedAccounts') }}
                </div>
            </div>
        </div>

        <Dialog :header="$t('login.saveAccount')" v-model:visible="displayNameDialog" class="display-name-dialog" :modal="true">
            <div>
                <InputText :placeholder="$t('login.displayName')" v-model="loginData.displayName" class="w-full mt-3" />
            </div>

            <div class="mt-3">
                <Checkbox v-model="savePassword" :binary="true" class="mr-1" />
                {{ $t('login.savePassword') }} ?
            </div>

            <div class="p-text-secondary" v-if="savePassword">
                <p class="mb-0">
                    
                    <b>{{ $t('login.passwordNote') }}</b>: {{ $t('login.passwordNoteText') }}
                </p>
            </div>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button
                        :label="$t('general.cancel')"
                        @click="displayNameDialog = false"
                        class="p-button-text"
                    />
                    <Button :label="$t('general.save')" @click="SaveAccount" />
                </div>
            </template>
        </Dialog>

        <Dialog :header="$t('login.typePassword')" v-model:visible="selectedAccount" class="display-name-dialog" :modal="true">
            <div class="p-text-secondary">
                <InputText type="password" :placeholder="$t('login.password')" v-model="selectedAccountPassword" class="w-full mt-3" />
            </div>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button
                        :label="$t('general.cancel')"
                        @click="selectedAccount = false"
                        class="p-button-text"
                    />
                    <Button :label="$t('login.login')" @click="LoadAccount" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style>
.loginData-card {
    width: 550px;
    max-width: 90vw;
}

.login-button {
    width: 200px;
    max-width: 100%;
}

.loginData-margin {
    margin-top: 70px;
}

.display-name-dialog {
    width: 400px;
}
</style>
