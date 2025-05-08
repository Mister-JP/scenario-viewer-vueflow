// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ScenarioViewerPage from '../pages/ScenarioViewerPage.vue'; // Should be this
import MarkdownTestPage from '../pages/MarkdownTestPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'ScenarioViewer',
    component: ScenarioViewerPage, // And used here
  },
  {
    path: '/md',
    name: 'MarkdownTest',
    component: MarkdownTestPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;