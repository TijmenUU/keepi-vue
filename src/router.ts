import WeekView from "@/views/WeekView.vue";
import SetupNoko from "@/views/SetupNoko.vue";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: WeekView },
    { path: "/setup", component: SetupNoko },
  ],
});
