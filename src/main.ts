// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './index.css'

import App from './App.vue'

// Vue Flow CSS
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'


import '@vue-flow/minimap/dist/style.css'     // Assuming this one is correct
import '@vue-flow/controls/dist/style.css'    // Assuming this one is correct

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')