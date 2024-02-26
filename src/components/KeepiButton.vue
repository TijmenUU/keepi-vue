<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "outline" | "blue" | "green" | "red";
    disabled?: boolean;
  }>(),
  {
    variant: "outline",
    disabled: false,
  },
);

const emits = defineEmits<{
  (e: "click"): void;
}>();

const onClick = () => {
  if (props.disabled) {
    return;
  }
  emits("click");
};
</script>

<template>
  <button
    :class="{
      'rounded border p-2 transition duration-200': true,
      'border-gray-400 hover:bg-gray-600': props.variant === 'outline',
      'border-none bg-blue-800 hover:bg-blue-600': props.variant === 'blue',
      'border-none bg-green-800 hover:bg-green-600': props.variant === 'green',
      'border-none bg-red-800 hover:bg-red-600': props.variant === 'red',
      'cursor-not-allowed opacity-50': props.disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>
