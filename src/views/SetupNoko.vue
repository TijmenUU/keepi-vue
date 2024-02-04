<script setup lang="ts">
import { useApplicationStore } from "@/store/application-store";
import { useRouter } from "vue-router";

const router = useRouter();
const applicationStore = useApplicationStore();

const onSubmit = async () => {
  if (!(await applicationStore.tryLoadApiKey())) {
    return;
  }

  if (applicationStore.requiresCategories) {
    await router.push("/categories");
  } else {
    await router.push("/");
  }
};
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <label>
      Noko API key

      <input type="text" v-model="applicationStore.apiKey" />
    </label>

    <button style="margin-top: 10px" @click="onSubmit">Opslaan</button>
  </div>
</template>
