<script>
    export default {
        name: 'AccountItem',

        props : [
            'index',
            'account',
            'remove',
            'load',
            'edit'
        ]
    }
</script>

<template>
    <div class="p-4 border-round surface-overlay mb-3 hover:surcace-ground shadow-2">
        <div class="flex justify-content-between">
            <div class="flex align-items-center cursor-pointer hover:text-primary" @click="load(index)">
                <div class="mr-3">
                    <i class="pi pi-database text-xl"></i>
                </div>
                <div>
                    <div class="text-lg">{{ account.displayName }}</div>
                    <div class="text-xs">
                        {{ account.username }}@{{ account.host }}
                    </div>
                </div>
            </div>
            <div>
                <Button icon="pi pi-pencil" class="p-button-text p-button-rounded  p-button-warning" @click="edit(index)" />
                <Button icon="pi pi-trash" class="p-button-text p-button-rounded  p-button-danger" @click="remove(index)" />
            </div>
        </div>
    </div>
</template>
