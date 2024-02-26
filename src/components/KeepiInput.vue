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
  },
);

const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "keyup", value: KeyboardEvent): void;
}>();
</script>

<template>
  <input
    class="rounded border-b border-gray-600 bg-gray-800 text-center ring-gray-400 focus:outline-none focus:ring-2"
    :name="props.name"
    :type="props.type"
    :value="props.modelValue"
    :autofocus="props.autofocus"
    @input="
      emits(
        'update:modelValue',
        ($event.target as HTMLInputElement)?.value ?? '',
      )
    "
    @keyup="emits('keyup', $event)"
    :readonly="props.readonly"
    :tabindex="props.tabIndex"
  />
</template>
