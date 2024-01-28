<script setup lang="ts"></script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in" appear>
      <Suspense>
        <component :is="Component"></component>

        <template #fallback> Loading ... </template>
      </Suspense>
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
