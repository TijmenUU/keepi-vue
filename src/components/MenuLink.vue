<script setup lang="ts">
const props = defineProps<{
  route: string;
}>();
</script>

<template>
  <router-link
    custom
    :to="props.route"
    v-slot="{ isExactActive, href, navigate }"
  >
    <a
      :href="href"
      @click="navigate"
      class="block bg-transparent p-0"
      :class="{
        'text-white': !isExactActive,
        'text-blue-500': isExactActive,
      }"
    >
      <slot></slot>
    </a>
  </router-link>
</template>
