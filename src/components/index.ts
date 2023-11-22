import type {App, Plugin} from 'vue';
import CvnDataTable from './CstmTable.vue';
import CvnButton from './CstmButton.vue';

const cstmComponents: Plugin = {
    install: (Vue: App) => {
        Vue.component('cstm-table', CvnDataTable);
        Vue.component('cstm-btn', CvnButton);
    },
};
export default cstmComponents;
