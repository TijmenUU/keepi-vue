<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { useApplicationStore } from "@/store/application-store";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const applicationStore = useApplicationStore();

const isSubmitting = ref(false);

const onSubmit = async () => {
  if (isSubmitting.value) {
    return;
  }
  isSubmitting.value = true;

  try {
    if (!(await applicationStore.tryLoadApiKey())) {
      return;
    }

    if (applicationStore.requiresCategories) {
      await router.push("/categories");
    } else {
      await router.push("/");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    class="mx-auto flex flex-col items-center justify-center py-3 lg:container"
  >
    <label class="mb-3">
      <span class="mr-3 font-bold">Noko API key</span>

      <KeepiInput
        type="text"
        v-model="applicationStore.apiKey"
        :disabled="isSubmitting"
      />
    </label>

    <KeepiButton @click="onSubmit" :disabled="isSubmitting" variant="green"
      >Opslaan</KeepiButton
    >
  </div>
</template>
