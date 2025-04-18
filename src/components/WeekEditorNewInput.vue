<script setup lang="ts">
import type { RegleFieldStatus } from "@regle/core";
import { computed } from "vue";
import Popper from "vue3-popper";

const model = defineModel<string>();

const props = defineProps<{
  forceShowError: boolean;
  field: RegleFieldStatus;
}>();

const errorMessage = computed<string>(() => {
  if (props.field.$errors.length > 0) {
    return props.field.$errors[0];
  }
  return "";
});
</script>

<template>
  <div>
    <Popper
      :content="errorMessage"
      :show="field.$error || forceShowError"
      placement="top"
      class="error-popup"
      arrow
      open-delay="100"
      close-delay="100"
    >
      <input
        class="w-full rounded-md border border-gray-500 text-center"
        :class="{ 'border-red-500': props.field.$invalid }"
        type="text"
        v-model="model"
      />
    </Popper>
  </div>
</template>
