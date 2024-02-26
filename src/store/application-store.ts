import NokoClient from "@/noko-client";
import { TagToCategoryMapping } from "@/types";
import { defineStore } from "pinia";

const apiKeyLocalStorageKey = "noko-api-key";
const categoriesLocalStorageKey = "categories";
let cachedNokoClient: NokoClient | null = null;

interface IState {
  apiKey: string;
  nokoUser: {
    id: number;
    email: string;
    name: string;
  } | null;
  categories: TagToCategoryMapping[];
}

export const useApplicationStore = defineStore("application", {
  state: (): IState => {
    return {
      apiKey: "",
      nokoUser: null,
      categories: [],
    };
  },

  getters: {
    requiresSetup: (state) => {
      return state.apiKey === "" || state.nokoUser === null;
    },
    requiresCategories: (state) => {
      return state.categories.length === 0;
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

      this.categories = tryParseStoredCategories(
        localStorage.getItem(categoriesLocalStorageKey),
      );
    },
    peristCategories(): void {
      localStorage.setItem(
        categoriesLocalStorageKey,
        JSON.stringify(this.categories),
      );
    },
    getNokoClient(): NokoClient {
      if (this.apiKey === "") {
        throw new Error(
          "Cannot create the Noko API client without a valid API token",
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

      localStorage.setItem(apiKeyLocalStorageKey, this.apiKey);
      return true;
    },
  },
});

function tryParseStoredCategories(json?: unknown): TagToCategoryMapping[] {
  if (json == null || typeof json !== "string") {
    return [];
  }

  const array = JSON.parse(json);
  if (array == null || !Array.isArray(array)) {
    return [];
  }

  const results: TagToCategoryMapping[] = [];
  for (let i = 0; i < array.length; ++i) {
    const candidate = array[i];
    if (
      candidate != null &&
      typeof candidate === "object" &&
      "order" in candidate &&
      typeof candidate.order === "number" &&
      "archived" in candidate &&
      typeof candidate.archived === "boolean" &&
      "projectId" in candidate &&
      typeof candidate.projectId === "number" &&
      "nokoTags" in candidate &&
      Array.isArray(candidate.nokoTags) &&
      (candidate.nokoTags as unknown[]).length > 0 &&
      (candidate.nokoTags as unknown[]).every((e) => typeof e === "string") &&
      "name" in candidate &&
      typeof candidate.name === "string"
    ) {
      results.push({
        order: candidate.order,
        archived: candidate.archived,
        projectId: candidate.projectId,
        nokoTags: candidate.nokoTags,
        name: candidate.name,
      });
    } else {
      console.debug("Stored tag to category mapping is not valid", candidate);
    }
  }

  results.sort((a, b) => a.order - b.order);

  return results;
}
