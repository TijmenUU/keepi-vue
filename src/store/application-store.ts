import { defineStore } from "pinia";

const apiKeyLocalStorageKey = "noko-api-key";

export const useApplicationStore = defineStore("application", {
  state: () => {
    return { apiKey: "" };
  },

  getters: {
    requiresConfiguration: (state) => {
      return state.apiKey === "";
    },
  },

  actions: {
    hydrate(): void {
      const storedKey = localStorage.getItem(apiKeyLocalStorageKey);
      if (storedKey != null && storedKey.length > 0) {
        this.apiKey = storedKey;
      }
    },
  },
});
