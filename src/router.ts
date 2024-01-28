import WeekEditor from "@/views/WeekEditor.vue";
import SetupNoko from "@/views/SetupNoko.vue";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: WeekEditor },
    { path: "/setup", component: SetupNoko },
  ],
});
