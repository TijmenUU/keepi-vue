import WeekEditor from "@/views/WeekEditor.vue";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/editor", component: WeekEditor }],
});
