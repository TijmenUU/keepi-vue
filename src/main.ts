import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import { router } from "@/router";
import { createPinia } from "pinia";
import { useApplicationStore } from "@/store/application-store";

const pinia = createPinia();

useApplicationStore(pinia)
  .hydrate()
  .then(() => createApp(App).use(pinia).use(router).mount("#app"));
