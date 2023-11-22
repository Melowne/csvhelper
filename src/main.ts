import {createApp} from 'vue';
import App from './App.vue';
import cstmComponents from './components';
import './assets/main.scss';

const app = createApp(App);
app.use(cstmComponents);
app.mount('#app');
