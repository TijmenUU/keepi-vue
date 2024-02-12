import WeekView from "@/views/WeekView.vue";
import SetupNoko from "@/views/SetupNoko.vue";
import SetupCategories from "@/views/SetupCategories.vue";

import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  // Remember to update the ../public/staticwebapp.config.json file too when adding
  // or changing routes
  routes: [
    { path: "/", component: WeekView },
    { path: "/setup", component: SetupNoko },
    { path: "/categories", component: SetupCategories },
  ],
});
