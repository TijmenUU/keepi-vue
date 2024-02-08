<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name?: string;
    type?: "text" | "number";
    modelValue: string;
    readonly?: boolean;
    tabIndex?: 0 | -1;
    autofocus?: boolean;
  }>(),
  {
    name: "",
    type: "text",
    readonly: false,
    tabIndex: 0,
    autofocus: false,
  }
);

const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <input
    class="border-b border-gray-600 text-center bg-gray-800 focus:outline-none focus:ring-2 ring-gray-400 rounded"
    :name="props.name"
    :type="props.type"
    :value="props.modelValue"
    :autofocus="props.autofocus"
    @input="
      emits(
        'update:modelValue',
        ($event.target as HTMLInputElement)?.value ?? ''
      )
    "
    :readonly="props.readonly"
    :tabindex="props.tabIndex"
  />
</template>
