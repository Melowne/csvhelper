import type {Ref} from 'vue';
import {ref} from 'vue';

export class CsvService {
    items: Ref<any[]> = ref([]);
    itemsCopy: Ref<any[]> = ref([]);
    columns: Ref<{label: string; prop: string}[]> = ref([]);
    edit = ref(false);
    filename = '';
    private lines: string[] = [];

    async loadCsvItems(fileContent: string) {
        this.lines = fileContent.split('\n');

        let columnNames: string[] = [];
        if (this.checkSeperator()) columnNames = this.lines[0].split(',');
        else columnNames = this.lines[0].split(';');

        this.columns.value = columnNames.map((columnName) => ({
            label: columnName.replace(/"/g, ''),
            prop: `${columnName}`,
        }));
        type DynamicType = Record<
            (typeof columnNames)[number],
            string | number
        > & {uniqueid: string};

        let uniqueIdCounter = 1;

        for (let i = 1; i < this.lines.length; i++) {
            let rowData: string[] = [];
            if (this.checkSeperator()) rowData = this.lines[i].split(',');
            else rowData = this.lines[i].split(';');
            // Create an object with dynamic type
            const dynamicRow: DynamicType = {
                uniqueid: `uniqueid${uniqueIdCounter++}`,
            };
            columnNames.forEach((columnName, index) => {
                if (columnName !== 'uniqueid' && rowData[index]) {
                    let cleanedValue = rowData[index].replace(/"/g, '');
                    dynamicRow[columnName] = cleanedValue;
                }
            });
            this.items.value.push(dynamicRow);
        }
        this.itemsCopy.value = JSON.parse(JSON.stringify(this.items.value));
        console.log(this.items);
    }
    private itemsToCsv(
        items: any[],
        columns: {label: string; prop: string}[],
        separator: string,
    ): string {
        const columnNames = columns.map((column) => `"${column.label}"`);
        const header = columnNames.join(separator).replace(/\r/g, '');

        const rows = items.map((item) => {
            const values = columns.map((column) => item[column.prop]);
            return values.map((value) => `"${value}"`).join(separator);
        });
        const cleanedRows = rows.map((row) => row.replace(/\r/g, ''));
        return [header, ...cleanedRows].join('\n');
    }

    async saveItem() {
        try {
            let csvContent: string;
            if (this.checkSeperator())
                csvContent = this.itemsToCsv(
                    this.items.value,
                    this.columns.value,
                    ',',
                );
            else
                csvContent = this.itemsToCsv(
                    this.items.value,
                    this.columns.value,
                    ';',
                );

            const edittedItemsBlob = new Blob([csvContent], {
                type: 'text/csv',
            });
            this.downloadFile(edittedItemsBlob, this.filename);
            this.itemsCopy.value = JSON.parse(JSON.stringify(this.items.value));
            this.edit.value = false;
        } catch (error) {
            console.error('Fehler beim Downloaden des Logs:', error);
        }
    }
    private downloadFile(blob: Blob, filename: string) {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.style.display = 'none';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
    }
    resetItems() {
        this.items.value = JSON.parse(JSON.stringify(this.itemsCopy.value));
        this.edit.value = false;
    }

    setItem(index: number, key: string, val: string) {
        if (this.items.value[index][key] !== val) this.edit.value = true;
        this.items.value[index][key] = val;
    }
    private checkSeperator() {
        return (
            this.lines[0].split(',').length - 1 >
            this.lines[0].split(';').length - 1
        );
    }
    private static instance: CsvService;
    public static getInstance() {
        if (!CsvService.instance) {
            CsvService.instance = new CsvService();
        }
        return CsvService.instance;
    }
}
