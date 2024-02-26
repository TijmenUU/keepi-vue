<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<template>
  <input
    type="checkbox"
    :checked="props.modelValue"
    @change="
      emits(
        'update:modelValue',
        ($event.target as HTMLInputElement)?.checked ?? false,
      )
    "
    class="h-4 w-4 rounded"
  />
</template>
