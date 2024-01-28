import NokoClient from "@/noko-client";
import { defineStore } from "pinia";

const apiKeyLocalStorageKey = "noko-api-key";
let cachedNokoClient: NokoClient | null = null;

interface IState {
  apiKey: string;
  nokoUser: {
    id: number;
    email: string;
    name: string;
  } | null;
}

export const useApplicationStore = defineStore("application", {
  state: (): IState => {
    return {
      apiKey: "",
      nokoUser: null,
    };
  },

  getters: {
    requiresConfiguration: (state) => {
      return state.apiKey === "" || state.nokoUser === null;
    },
  },

  actions: {
    async hydrate(): Promise<void> {
      const storedKey = localStorage.getItem(apiKeyLocalStorageKey);
      if (storedKey == null || storedKey.length === 0) {
        return;
      }
      this.apiKey = storedKey;

      await this.tryLoadApiKey();
    },
    getNokoClient(): NokoClient {
      if (this.apiKey === "") {
        throw new Error(
          "Cannot create the Noko API client without a valid API token"
        );
      }
      if (
        cachedNokoClient == null ||
        cachedNokoClient.getToken() != this.apiKey
      ) {
        cachedNokoClient = new NokoClient(this.apiKey);
      }
      return cachedNokoClient;
    },
    async tryLoadApiKey(): Promise<boolean> {
      try {
        const user = await this.getNokoClient().getCurrentUser();
        if (user.state === "active") {
          this.nokoUser = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
          };
        } else {
          console.error(`User state (${user.state}) is not active`);
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }

      return true;
    },
  },
});
