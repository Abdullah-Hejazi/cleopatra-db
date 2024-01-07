<script>

import { appWindow } from '@tauri-apps/api/window'

export default {
    name: 'TitleBar',

    props: [
        'settings',
        'about'
    ],

    methods: {
        Minimize() {
            appWindow.minimize()
        },

        Maximize() {
            appWindow.toggleMaximize()
        },

        Close() {
            appWindow.close()
        },

        Logout() {
            this.$store.dispatch('database/clearConnection');
            this.$router.push('/');
        },

        Home () {
            this.$router.push('/databases')
        }
    }
}
</script>

<template>
    <div class="title-bar surface-overlay px-1 flex justify-content-between">
        <div class="flex align-items-center">
            <div class="flex align-items-center">
                <img alt="logo" src="@/assets/logo2.png" height="34" class="mx-3">
                <Button v-if="$store.state.database.connected" icon="pi pi-home" class="p-button-text p-button-plain" :label="$t('general.home')" @click="Home" />
                <Button icon="pi pi-cog" class="p-button-plain p-button-text ml-1" :label="$t('general.settings')" @click="settings" />
                <Button icon="pi pi-id-card" class="p-button-plain p-button-text ml-1" :label="$t('general.about')" @click="about" />
                <Button v-if="$store.state.database.connected" icon="pi pi-power-off" class="p-button-plain p-button-text ml-1" :label="$t('general.logout')" @click="Logout" />
            </div>
            <div data-tauri-drag-region class="text-500 drag-bar flex-grow-1">
                &nbsp;
            </div>
        </div>

        <div class="flex flex-grow-1 align-items-center justify-content-center">
            <div class="text-gray-200" v-if="$store.state.database?.data">
                {{ $store.state.database.data.user }}@{{ $store.state.database.data.host }}
            </div>
        </div>

        <div class="flex align-items-center py-2">
            <Button icon="pi pi-minus" class="p-button-text p-button-plain" @click="Minimize" />
            <Button icon="pi pi-window-maximize" class="p-button-text p-button-plain" @click="Maximize" />
            <Button icon="pi pi-times" class="p-button-text p-button-plain" @click="Close" />
        </div>
    </div>
</template>

<style>
    .title-bar {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .drag-bar {
        -webkit-app-region: drag;
        height: 100%;
    }
</style>