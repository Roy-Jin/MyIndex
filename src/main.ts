import { createApp } from "vue";
import { createPinia } from "pinia";
import { routes } from "vue-router/auto-routes";
import { createRouter, createWebHistory } from "vue-router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import i18n from "./i18n";

import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia().use(piniaPluginPersistedstate);

app.use(pinia);
app.use(createRouter({
    history: createWebHistory(),
    routes,
}));
app.use(i18n);

app.mount("#app");