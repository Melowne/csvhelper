<template>
    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th
                        v-for="(column, index) in columns"
                        :key="index"
                        @click="sort(column.prop)"
                        @mouseover="hovered = column.prop"
                    >
                        {{ column.label }}
                        <span
                            class="sort-icon"
                            v-if="
                                (sortedBy === column.prop ||
                                    hovered === column.prop) &&
                                sorted &&
                                column.prop !== 'spacer'
                            "
                        >
                            {{ sortDirection === 'asc' ? '↓' : '↑' }}
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, indexi) in sortedItems" :key="indexi">
                    <td v-for="(key, indexj) in columns" :key="indexj">
                        <input
                            v-model="editableValues[item.uniqueid][key.prop]"
                            @blur="
                                setItem(
                                    indexi,
                                    key.prop,
                                    editableValues[item.uniqueid][key.prop],
                                    item.uniqueid,
                                )
                            "
                            style="
                                font-size: large;
                                font-weight: bold;
                                border: none;
                                outline: none;
                            "
                        />
                        <cstm-btn
                            v-if="indexj == columns.length - 1 && edit"
                            color="reset"
                            @click="removeRow(indexi)"
                            >X</cstm-btn
                        >
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import {defineComponent, reactive, ref, Ref, watchEffect} from 'vue';
import {csvStore} from '../services/index';
interface DataTableColumn {
    label: string;
    prop: string;
}

export default defineComponent({
    name: 'CstmTable',
    props: {
        maxHeight: {
            type: String,
            default: 'none',
        },
        sorted: {
            type: Boolean,
        },
    },
    data() {
        return {
            sortedBy: '',
            sortDirection: 'asc',
            hovered: '',
            valuetoSet: '',
            edit: false,
        };
    },
    setup() {
        const columns: Ref<DataTableColumn[]> = ref([]);
        const items: Ref<any[]> = ref([]);
        const editableValues = ref<Record<string, Record<string, string>>>({});
        watchEffect(() => {
            columns.value = csvStore.columns.value;
            items.value = csvStore.items.value;
            editableValues.value = Object.fromEntries(
                items.value.map((item) => [
                    item.uniqueid,
                    Object.fromEntries(
                        columns.value.map((col) => [
                            col.prop,
                            item[col.prop] || '',
                        ]),
                    ),
                ]),
            );
        });
        const edit = csvStore.edit;
        return {
            columns,
            editableValues,
            edit,
        };
    },
    computed: {
        sortedItems() {
            const items = reactive([...csvStore.items.value]);
            if (this.sortedBy && this.sorted) {
                const prop = this.sortedBy;

                items.sort((a: any, b: any) => {
                    const valueA = this.getColumnValue(a, prop);
                    const valueB = this.getColumnValue(b, prop);

                    const dataTypeA = this.getDataType(valueA);
                    const dataTypeB = this.getDataType(valueB);

                    const comparisonFunction = this.getComparisonFunction(
                        dataTypeA,
                        dataTypeB,
                    );

                    const result =
                        this.sortDirection === 'asc'
                            ? comparisonFunction(valueA, valueB)
                            : comparisonFunction(valueB, valueA);

                    return this.sortDirection === 'desc' ? -result : result;
                });
            }

            return items;
        },
    },
    methods: {
        sort(prop: any) {
            if (this.sortedBy === prop) {
                this.sortDirection =
                    this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortedBy = prop;
                this.sortDirection = 'asc';
            }
        },
        getDataType(value: any): string {
            // Heuristic to determine data type
            if (value === null) {
                return 'null';
            } else if (typeof value === 'number' || !isNaN(Number(value))) {
                return 'number';
            } else if (value instanceof Date) {
                return 'date';
            } else {
                return 'string';
            }
        },
        getComparisonFunction(dataTypeA: string, dataTypeB: string): Function {
            if (dataTypeA === 'date' && dataTypeB === 'date') {
                return this.sortDate;
            } else if (dataTypeA === 'number' && dataTypeB === 'number') {
                return this.sortNumber;
            } else {
                return this.sortString;
            }
        },
        displayValue(item: any, prop: any) {
            return item[prop] || '';
        },
        sortString(valueA: string, valueB: string) {
            if (valueB === undefined) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }

            if (valueA.toLocaleLowerCase() > valueB.toLocaleLowerCase()) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            if (valueA.toLocaleLowerCase() < valueB.toLocaleLowerCase()) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            return 0;
        },
        getColumnValue(item: any, prop: string) {
            return item[prop] !== undefined ? item[prop] : '';
        },
        sortNumber(valueA: number, valueB: number) {
            return (valueA - valueB) * (this.sortDirection === 'asc' ? 1 : -1);
        },
        sortDate(valueA: Date, valueB: Date) {
            if (valueA < valueB) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        },
        parseDate(dateStr: string) {
            const [day, month, year, hour, minute] = dateStr.split(/[.: ]/);
            return new Date(`${year}-${month}-${day}T${hour}:${minute}`);
        },
        adjustDate(dateStr: string): Date | null {
            const [day, month, year] = dateStr.split('.');
            if (day && month && year) {
                return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                );
            }
            return null;
        },
        setItem(index: number, key: string, val: string, id: string) {
            if (val.includes(',') || val.includes(';')) {
                this.editableValues[id][key] = this.sortedItems[index][key];
            } else csvStore.setItem(index, key, val);
        },
        removeRow(i: number) {
            csvStore.removeRow(i);
        },
    },
});
</script>
<style scoped lang="scss">
.data-table {
    .toggle-icon {
      cursor: pointer;
    }

  --max-height: {{ maxHeight }};



}
table {
    width: 100%;
    border-collapse: collapse;
    font-weight:350 ;
  }
td{border: solid black 1px;}
  th:hover .sort-icon {
    visibility: visible;}
  .spacer::before {
  content: " ";
}

.custom-cell {
  color: red;
}
</style>
