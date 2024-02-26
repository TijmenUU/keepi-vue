<script setup lang="ts">
const props = defineProps<{
  route: string;
}>();
</script>

<template>
  <router-link custom :to="props.route" v-slot="{ isActive, href, navigate }">
    <a
      :href="href"
      @click="navigate"
      class="block bg-transparent p-0 text-white"
      :class="{ 'text-blue-500': isActive }"
    >
      <slot></slot>
    </a>
  </router-link>
</template>
