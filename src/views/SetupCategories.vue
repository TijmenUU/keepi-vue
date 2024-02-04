<script setup lang="ts">
import { useApplicationStore } from "@/store/application-store";
import { TagToCategoryMapping } from "@/types";
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";

type CategoryEntry = TagToCategoryMapping & { id: number };

const router = useRouter();
const applicationStore = useApplicationStore();
const nokoClient = applicationStore.getNokoClient();

const projects = (await nokoClient.getProjects())
  .filter(
    (p) =>
      p.enabled &&
      p.participants.some((p) => p.id === applicationStore.nokoUser?.id)
  )
  .map((p) => ({ id: p.id, name: p.name }));
const tags = (await nokoClient.getTags()).map((t) => t.formatted_name);

const toAdd = reactive({
  name: "",
  projectId: "",
  tagSearch: "",
  nokoTags: [] as string[],
});
let nextCategoryId = 0;
const values: CategoryEntry[] = reactive(
  applicationStore.categories
    .map((c, index) => ({
      id: nextCategoryId++,
      archived: c.archived,
      order: index,
      projectId: c.projectId,
      nokoTags: c.nokoTags.slice(),
      name: c.name,
    }))
    .sort((a, b) => a.order - b.order)
);

const getProjectName = (id: number): string => {
  return projects.find((p) => p.id === id)?.name ?? "Onbekend";
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

const onAddTag = (tag: string) => {
  if (tag != null && tag.length > 0 && !toAdd.nokoTags.some((t) => t === tag)) {
    toAdd.nokoTags.push(tag);
  }
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
    archived: false,
    order: values.length,
    projectId,
    nokoTags: toAdd.nokoTags,
    name: toAdd.name,
  });

  toAdd.name = "";
  toAdd.projectId = "";
  toAdd.tagSearch = "";
  toAdd.nokoTags = [];
};

const onSubmit = async () => {
  if (values.length < 1) {
    return;
  }
  if (
    values.some((v1) =>
      values.some((v2) => v1.order == v2.order && v1.id !== v2.id)
    )
  ) {
    return;
  }
  if (
    values.some((v1) =>
      values.some((v2) => v1.name == v2.name && v1.id !== v2.id)
    )
  ) {
    return;
  }

  applicationStore.categories = values
    .slice()
    .sort((a, b) => a.order - b.order);
  applicationStore.peristCategories();

  await router.push("/");
};
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <table>
      <tr>
        <th>Volgorde</th>
        <th>Naam</th>
        <th>Project</th>
        <th>Tags</th>
        <th>Readonly</th>
        <th></th>
      </tr>

      <tr v-for="value in values" :key="value.id">
        <td>
          <input v-model="value.order" />
        </td>
        <td>
          <input v-model="value.name" />
        </td>
        <td>{{ getProjectName(value.projectId) }}</td>
        <td>{{ value.nokoTags.join(", ") }}</td>
        <td>
          <input v-model="value.archived" type="checkbox" />
        </td>
        <td>
          <button @click="onDeleteValue(value.id)">Verwijder</button>
        </td>
      </tr>

      <tr>
        <td></td>
        <td>
          <input v-model="toAdd.name" />
        </td>
        <td>
          <select v-model="toAdd.projectId">
            <option default disabled value="">Maak een keuze</option>
            <option
              v-for="project in projects"
              :key="project.id"
              :value="project.id.toString()"
            >
              {{ project.name }}
            </option>
          </select>
        </td>
        <td style="display: flex; flex-direction: column">
          <span>{{ toAdd.nokoTags.join(", ") }}</span>

          <input v-model="toAdd.tagSearch" />
          <div style="display: flex; flex-direction: column">
            <div style="display: flex" v-for="tag in filteredTags" :key="tag">
              <span>{{ tag }}</span>
              <button @click="onAddTag(tag)">+</button>
            </div>
          </div>
          <!-- todo add tag suggestions here -->
        </td>
        <td>
          <!-- Adding archived tags is not in scope for now -->
        </td>
        <td>
          <button @click="onAddCategory()">Toevoegen</button>
        </td>
      </tr>
    </table>

    <button style="margin-top: 10px" @click="onSubmit">Opslaan</button>
  </div>
</template>

<style scoped>
td {
  vertical-align: top;
}
</style>
