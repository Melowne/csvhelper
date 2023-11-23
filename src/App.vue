<script lang="ts" setup>
import {ref} from 'vue';
import {csvStore} from './services/index';

const fileInputRef = ref<HTMLInputElement | null>(null);
const items = csvStore.items;
const columns = csvStore.columns;
const handleFileSelect = () => {
    items.value = [];
    const fileInput = fileInputRef.value;
    if (fileInput?.files) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        csvStore.filename = file.name;
        if (
            file.type === 'application/vnd.ms-excel' ||
            file.type === 'text/csv'
        ) {
            reader.onload = (e) => {
                const fileContent = e.target?.result as string;
                csvStore.items.value = [];
                csvStore.columns.value = [];
                csvStore.loadCsvItems(fileContent);
            };
            reader.readAsText(file);
        }
    }
};
</script>

<template>
    <div>
        <div class="container">
            <div>
                <h1 style="text-align: center; color: #dcd6e6">CSV Helper</h1>
            </div>
            <div class="row">
                <cstm-btn
                    style="width: 150px"
                    for="fileInput"
                    @click="
                        csvStore.resetAll();
                        fileInputRef?.click();
                    "
                    >Choose a File</cstm-btn
                >&nbsp;
                <cstm-btn
                    v-if="csvStore.edit.value"
                    style="width: 150px"
                    color="secondary"
                    for="fileInput"
                    @click="csvStore.saveItem()"
                    >Save</cstm-btn
                >&nbsp;
                <cstm-btn
                    v-if="csvStore.edit.value"
                    style="width: 150px"
                    color="reset"
                    for="fileInput"
                    @click="csvStore.resetItems()"
                    >Reset</cstm-btn
                >
            </div>
            <hr />
            <div class="row">
                <cstm-table
                    v-if="items && columns"
                    class="table"
                    :sorted="!csvStore.edit.value"
                />
            </div>
        </div>
        <div class="row" v-if="csvStore.edit.value">
            <cstm-btn
                color="secondary"
                for="fileInput"
                @click="csvStore.addRow()"
                >+</cstm-btn
            >&nbsp;
        </div>
        <input
            ref="fileInputRef"
            type="file"
            @change="handleFileSelect"
            id="fileInput"
            style="display: none"
        />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

/* Style for the custom button */
.custom-file-input {
    display: none; /* Hide the default file input */
}

.custom-button {
    width: 10vw;
    text-align: center;
    display: inline-block;
    padding: 8px 12px;
    background-color: #4caf50;
    color: #fff;
    cursor: pointer;
}
</style>
