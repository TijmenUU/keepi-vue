<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiCheckbox from "@/components/KeepiCheckbox.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { useApplicationStore } from "@/store/application-store";
import { createSwapy } from "swapy";
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
} from "vue";
import {
  onBeforeRouteLeave,
  RouteLocationNormalizedGeneric,
  useRouter,
} from "vue-router";

type CategoryEntry = {
  id: number;
  readonly: boolean;
  projectId: number;
  nokoTags: string[];
  name: string;
};

const router = useRouter();
const applicationStore = useApplicationStore();

const loadProjects = async (refreshCache: boolean) => {
  return (await applicationStore.getCachedNokoProjects(refreshCache)).map(
    (p) => ({ id: p.id, name: p.name }),
  );
};

const loadTags = async (refreshCache: boolean) => {
  return (await applicationStore.getCachedNokoTags(refreshCache)).map(
    (t) => t.formatted_name,
  );
};

const projects = ref(await loadProjects(false));
const tags = ref(await loadTags(false));

const isSubmitting = ref(false);
const isRefetching = ref(false);

const ignoreUnsavedChanges = ref(false);
const pendingNavigationChange = ref<RouteLocationNormalizedGeneric | null>(
  null,
);

const toAdd = reactive({
  name: "",
  projectId: "",
  tagSearch: "",
  nokoTags: [] as string[],
});
let nextCategoryId = 0;
const values: CategoryEntry[] = reactive(
  applicationStore.categories.map((c, index) => ({
    id: nextCategoryId++,
    readonly: c.readonly,
    order: index + 1,
    projectId: c.projectId,
    nokoTags: c.nokoTags.slice(),
    name: c.name,
  })),
);

const swapyReportedOrder = ref<number[]>([]);
const swapyContainer = useTemplateRef("container");

const initializeSwapy = () => {
  if (swapyContainer.value != null) {
    const swapy = createSwapy(swapyContainer.value);
    swapy.onSwap((event) => {
      swapyReportedOrder.value = event.data.array
        .map((i) => i.itemId)
        .filter((i) => i != null)
        .map((i) => parseInt(i));
    });
  }
};

onMounted(() => {
  if (values.length > 0) {
    initializeSwapy();
  }
});

const getProjectName = (id: number): string => {
  return projects.value.find((p) => p.id === id)?.name ?? "Onbekend";
};

const onDeleteValue = (id: number): void => {
  const toDelete = values.findIndex((v) => v.id === id);
  if (toDelete >= 0) {
    values.splice(toDelete, 1);
  }
};

const filteredTags = computed<string[]>(() => {
  if (toAdd.tagSearch.length < 1) {
    return [];
  }
  const sanitizedInput = toAdd.tagSearch.toLowerCase().trim();
  const hits = tags.value.filter(
    (t) =>
      t.toLowerCase().includes(sanitizedInput) && !toAdd.nokoTags.includes(t),
  );
  if (hits.length > 5) {
    return hits.slice(0, 5);
  }
  return hits;
});

const hasNonEmptyEditor = computed<boolean>(() => {
  return toAdd.name != "" || toAdd.projectId != "" || toAdd.nokoTags.length > 0;
});

const isEditorValid = computed<boolean>(() => {
  return toAdd.name != "" && toAdd.projectId != "" && toAdd.nokoTags.length > 0;
});

const hasUnsavedProjectChanges = computed<boolean>(() => {
  const storedCategories = applicationStore.categories;
  if (values.length != storedCategories.length) {
    return true;
  }

  for (let i = 0; i < storedCategories.length; ++i) {
    const category = storedCategories[0];
    const value = values[0];
    if (
      category.name != value.name ||
      category.nokoTags.join() != value.nokoTags.join() ||
      swapyReportedOrder.value.length > 0 ||
      category.projectId != value.projectId ||
      category.readonly != value.readonly
    ) {
      return true;
    }
  }

  return false;
});

const submitButtonTitle = computed<string | null>(() => {
  if (hasNonEmptyEditor.value) {
    return "Er zijn nog niet opgeslagen wijzigingen in de nieuw toe te voegen regel";
  }
  if (!hasUnsavedProjectChanges.value) {
    return "Er zijn geen openstaande wijzigingen";
  }
  if (isRefetching.value) {
    return "De Noko projecten en tags worden ververst";
  }

  return null;
});

const onAddTag = (tag: string) => {
  if (tag != null && tag.length > 0 && !toAdd.nokoTags.some((t) => t === tag)) {
    toAdd.nokoTags.push(tag);
  }
  toAdd.tagSearch = "";
  document.getElementsByName("tagsearch")[0].focus();
};

const onAddCategory = () => {
  if (
    toAdd.name == null ||
    toAdd.name === "" ||
    values.some((v) => v.name === toAdd.name)
  ) {
    return;
  }

  const projectId = parseInt(toAdd.projectId);
  if (
    projectId == null ||
    isNaN(projectId) ||
    !projects.value.some((p) => p.id === projectId)
  ) {
    return;
  }

  if (tags.value.length === 0) {
    return;
  }

  values.push({
    id: nextCategoryId++,
    readonly: false,
    projectId,
    nokoTags: toAdd.nokoTags,
    name: toAdd.name,
  });

  onResetAdd();

  if (values.length === 1) {
    nextTick(initializeSwapy);
  }
};

const onResetAdd = (): void => {
  toAdd.name = "";
  toAdd.projectId = "";
  toAdd.tagSearch = "";
  toAdd.nokoTags = [];
};

const onSubmit = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    if (values.length < 1) {
      return;
    }
    if (
      values.some((v1) =>
        values.some((v2) => v1.name == v2.name && v1.id !== v2.id),
      )
    ) {
      return;
    }

    applicationStore.categories = values.map((v, index) => {
      let reportedOrder = swapyReportedOrder.value.findIndex((i) => i === v.id);
      if (reportedOrder < 0) {
        reportedOrder = index;
      }

      return {
        order: reportedOrder,
        readonly: v.readonly,
        projectId: v.projectId,
        nokoTags: v.nokoTags,
        name: v.name,
      };
    });
    applicationStore.peristCategories();

    await router.push("/");
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeRouteLeave((to, _) => {
  if (isSubmitting.value || ignoreUnsavedChanges.value) {
    return true;
  }
  if (hasNonEmptyEditor.value || hasUnsavedProjectChanges.value) {
    pendingNavigationChange.value = to;
    return false;
  }
});

const onIgnoreUnsavedChanges = async () => {
  if (pendingNavigationChange.value == null) {
    return;
  }

  ignoreUnsavedChanges.value = true;
  await router.push(pendingNavigationChange.value.fullPath);
};

const onAbortNavigation = () => {
  pendingNavigationChange.value = null;
};

const getRandomModalTitle = () => {
  const choices = [
    "Woeps!",
    "Ojee!",
    "Wow there cowboy!",
    "Uhh...",
    "Zeg makker",
  ];
  return choices[Math.floor(Math.random() * choices.length)];
};

const onRefetchNokoProjectsAndTags = async () => {
  if (isRefetching.value) {
    return;
  }

  isRefetching.value = true;
  try {
    projects.value = await loadProjects(true);
    tags.value = await loadTags(true);
  } finally {
    isRefetching.value = false;
  }
};
</script>

<template>
  <div
    class="container mx-auto flex max-w-screen-lg flex-col items-center px-2 py-3"
  >
    <div>
      <div
        class="flex flex-col items-center gap-2"
        :class="{ 'blur-sm': isSubmitting || isRefetching }"
        ref="container"
      >
        <div
          class="grid w-full grid-cols-[3fr_3fr_3fr_1fr_1fr] gap-2 px-2 font-bold"
        >
          <div>Naam</div>
          <div>Project</div>
          <div>Tags</div>
          <div>Readonly</div>
          <div></div>
        </div>

        <div
          v-for="(value, index) in values"
          :key="value.id"
          :data-swapy-slot="index"
          class="flex w-full flex-col rounded-md bg-gray-700"
        >
          <div
            class="grid w-full cursor-move grid-cols-[3fr_3fr_3fr_1fr_1fr] gap-2 rounded-md border border-gray-600 bg-gray-800 p-3 drop-shadow-md"
            :data-swapy-item="value.id"
          >
            <KeepiInput v-model="value.name" />

            <div
              class="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap"
            >
              {{ getProjectName(value.projectId) }}
            </div>

            <div class="flex flex-col overflow-x-hidden">
              <div
                v-for="tag in value.nokoTags"
                class="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap"
              >
                {{ tag }}
              </div>
            </div>

            <KeepiCheckbox v-model="value.readonly" type="checkbox" />

            <div>
              <button
                @click="onDeleteValue(value.id)"
                :disabled="isSubmitting"
                class="text-red-600 transition-colors duration-200 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2 grid grid-cols-[3fr_3fr_3fr_2fr] gap-2 p-3">
        <KeepiInput autofocus v-model="toAdd.name" />

        <div>
          <select
            class="max-w-44 rounded border border-gray-600 bg-transparent px-1"
            v-model="toAdd.projectId"
          >
            <option class="bg-gray-300 text-black" default disabled value="">
              Maak een keuze
            </option>

            <option
              class="bg-gray-300 text-black"
              v-for="project in projects"
              :key="project.id"
              :value="project.id.toString()"
            >
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col space-y-2">
          <KeepiInput
            v-model="toAdd.tagSearch"
            class="w-full"
            name="tagsearch"
            placeholder="Zoek op naam..."
          />

          <div class="flex flex-col space-y-2 overflow-x-hidden">
            <div v-for="tag in filteredTags" :key="tag" class="ml-2">
              <button
                class="transition-color rounded-full bg-green-800 p-1 px-3 text-left text-gray-300 duration-200 hover:bg-green-700 hover:text-white"
                @click="onAddTag(tag)"
              >
                <span
                  class="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap text-sm text-white"
                  >{{ tag }}
                </span>
              </button>
            </div>
          </div>

          <div
            v-for="tag in toAdd.nokoTags"
            class="overflow-x-hidden text-ellipsis whitespace-nowrap text-nowrap"
          >
            {{ tag }}
          </div>
        </div>

        <div>
          <KeepiButton
            class="w-full py-0"
            @click="onAddCategory()"
            :disabled="isSubmitting || !isEditorValid"
          >
            Toevoegen
          </KeepiButton>
        </div>
      </div>
    </div>

    <div class="mt-3 flex w-full justify-end gap-3">
      <KeepiButton
        @click="onRefetchNokoProjectsAndTags"
        variant="blue"
        :disabled="isRefetching"
      >
        Ververs projecten & tags
      </KeepiButton>

      <KeepiButton
        @click="onSubmit"
        variant="green"
        :disabled="
          isSubmitting ||
          isRefetching ||
          values.length < 1 ||
          hasNonEmptyEditor ||
          !hasUnsavedProjectChanges
        "
        :title="submitButtonTitle"
      >
        Opslaan
      </KeepiButton>
    </div>

    <Transition name="fade" mode="out-in" appear>
      <div
        v-if="pendingNavigationChange"
        class="pd-overlay fixed left-0 top-0 z-10 h-full w-full overflow-y-auto overflow-x-hidden"
      >
        <div class="m-5 sm:mx-auto sm:w-full sm:max-w-lg">
          <div class="flex flex-col rounded-lg bg-gray-700">
            <div
              class="flex items-center justify-between rounded-t border-b border-gray-600 p-4 md:p-5"
            >
              <h3 class="text-xl font-semibold text-white">
                {{ getRandomModalTitle() }}
              </h3>

              <button
                type="button"
                class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-600 hover:text-white"
                @click="onAbortNavigation"
              >
                <svg
                  class="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>

            <div class="space-y-4 p-4 md:p-5">
              <p
                class="text-base leading-relaxed text-gray-400"
                v-if="hasNonEmptyEditor"
              >
                Er is een ingevulde nieuw toe te voegen regel, weet je het zeker
                dat je deze wilt negeren?
              </p>

              <p class="text-base leading-relaxed text-gray-400" v-else>
                Er zijn nog onopgeslagen wijzigingen, weet je het zeker dat je
                deze wilt negeren?
              </p>
            </div>

            <div
              class="flex items-center justify-end gap-3 rounded-b border-t border-gray-600 p-4 md:p-5"
            >
              <KeepiButton
                class="text-sm"
                variant="outline"
                @click="onAbortNavigation"
              >
                Terug
              </KeepiButton>

              <KeepiButton variant="red" @click="onIgnoreUnsavedChanges">
                Negeer wijzigingen
              </KeepiButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
