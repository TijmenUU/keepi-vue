<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiCheckbox from "@/components/KeepiCheckbox.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { useApplicationStore } from "@/store/application-store";
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";

type CategoryEntry = {
  id: number;
  order: string;
  readonly: boolean;
  projectId: number;
  nokoTags: string[];
  name: string;
};

const router = useRouter();
const applicationStore = useApplicationStore();

const projects = (await applicationStore.getCachedNokoProjects(false))
  .filter(
    (p) =>
      p.enabled &&
      p.participants.some((p) => p.id === applicationStore.nokoUser?.id),
  )
  .map((p) => ({ id: p.id, name: p.name }));
const tags = (await applicationStore.getCachedNokoTags(false)).map(
  (t) => t.formatted_name,
);

const isSubmitting = ref(false);
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
    order: index.toString(),
    projectId: c.projectId,
    nokoTags: c.nokoTags.slice(),
    name: c.name,
  })),
);

const getProjectName = (id: number): string => {
  const name = projects.find((p) => p.id === id)?.name ?? "Onbekend";
  if (name.length > 9) {
    return `${name.substring(0, 8)}...`;
  }
  return name;
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
  const hits = tags.filter((t) => t.toLowerCase().includes(sanitizedInput));
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
      category.order.toString() != value.order ||
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
    !projects.some((p) => p.id === projectId)
  ) {
    return;
  }

  if (tags.length === 0) {
    return;
  }

  values.push({
    id: nextCategoryId++,
    readonly: false,
    order: values.length.toString(),
    projectId,
    nokoTags: toAdd.nokoTags,
    name: toAdd.name,
  });

  onResetAdd();
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
        values.some((v2) => v1.order == v2.order && v1.id !== v2.id),
      )
    ) {
      return;
    }
    if (
      values.some((v1) =>
        values.some((v2) => v1.name == v2.name && v1.id !== v2.id),
      )
    ) {
      return;
    }

    applicationStore.categories = values.map((v) => ({
      order: parseInt(v.order),
      readonly: v.readonly,
      projectId: v.projectId,
      nokoTags: v.nokoTags,
      name: v.name,
    }));
    applicationStore.peristCategories();

    await router.push("/");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="mx-auto flex flex-col items-center py-3 lg:container">
    <div>
      <div>
        <table
          class="mt-3 table-auto text-center"
          :class="{ 'blur-sm': isSubmitting }"
        >
          <tr>
            <th>Volgorde</th>
            <th>Naam</th>
            <th>Project</th>
            <th>Tags</th>
            <th>Readonly</th>
            <th></th>
          </tr>

          <template v-if="values.length > 0">
            <tr v-for="value in values" :key="value.id">
              <td>
                <KeepiInput
                  style="width: 40px"
                  v-model="value.order"
                  type="text"
                  inputmode="numeric"
                />
              </td>
              <td>
                <KeepiInput v-model="value.name" />
              </td>
              <td>
                {{ getProjectName(value.projectId) }}
              </td>
              <td>{{ value.nokoTags.join(", ") }}</td>
              <td>
                <KeepiCheckbox v-model="value.readonly" type="checkbox" />
              </td>
              <td>
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
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="99" class="text-gray-400">
                Er zijn nog geen categorieën aangemaakt
              </td>
            </tr>
          </template>

          <tr>
            <td colspan="99" class="h-10"></td>
          </tr>

          <tr>
            <td class="align-top">
              <button
                @click="onResetAdd"
                class="transition-color text-gray-400 duration-200 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </td>
            <td class="align-top">
              <KeepiInput autofocus v-model="toAdd.name" />
            </td>
            <td class="align-top">
              <select
                class="max-w-44 rounded border border-gray-600 bg-transparent px-1"
                v-model="toAdd.projectId"
              >
                <option
                  class="bg-gray-300 text-black"
                  default
                  disabled
                  value=""
                >
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
            </td>
            <td>
              <div class="flex flex-col space-y-2">
                <span
                  v-if="toAdd.nokoTags.length > 0"
                  class="overflow-ellipsis whitespace-nowrap"
                  >{{ toAdd.nokoTags.join(", ") }}</span
                >
                <span v-else class="text-gray-400">~</span>

                <KeepiInput
                  v-model="toAdd.tagSearch"
                  name="tagsearch"
                  placeholder="Zoek op naam..."
                />
                <div class="flex flex-col space-y-1">
                  <div
                    class="flex items-center"
                    v-for="tag in filteredTags"
                    :key="tag"
                  >
                    <button
                      class="transition-color text-gray-300 duration-200 hover:text-white"
                      @click="onAddTag(tag)"
                    >
                      <span class="overflow-ellipsis text-sm">{{ tag }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- todo add tag suggestions here -->
            </td>
            <td>
              <!-- Adding readonly tags is not in scope for now -->
            </td>
            <td class="align-top">
              <KeepiButton
                @click="onAddCategory()"
                :disabled="isSubmitting || !isEditorValid"
                >Toevoegen</KeepiButton
              >
            </td>
          </tr>
        </table>
      </div>

      <div class="w-full text-end">
        <KeepiButton
          @click="onSubmit"
          variant="green"
          :disabled="
            isSubmitting ||
            values.length < 1 ||
            hasNonEmptyEditor ||
            !hasUnsavedProjectChanges
          "
          :title="submitButtonTitle"
        >
          Opslaan
        </KeepiButton>
      </div>
    </div>
  </div>
</template>
