// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Make sure this is imported
import App from './App.vue';
import router from './router';

import './style.css';
import './index.css';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/controls/dist/style.css';

const app = createApp(App);
const pinia = createPinia(); // Create Pinia instance

app.use(pinia); // Use Pinia BEFORE router
app.use(router);

app.mount('#app');