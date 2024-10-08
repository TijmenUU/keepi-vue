<script setup lang="ts">
import NavigationMenu from "@/components/NavigationMenu.vue";
import { router } from "@/router";
import { useApplicationStore } from "@/store/application-store";
import { onMounted } from "vue";

const store = useApplicationStore();

onMounted(async () => {
  if (store.requiresSetup) {
    await router.push("/setup");
  } else if (store.requiresCategories) {
    await router.push("/categories");
  }
});
</script>

<template>
  <Transition name="fade" mode="out-in" appear>
    <NavigationMenu v-if="store.isConfigured" />
  </Transition>

  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in" appear>
      <Suspense timeout="0">
        <template v-if="Component">
          <component :is="Component"></component>
        </template>

        <template #fallback>
          <div class="flex flex-grow flex-col items-center justify-center">
            <div class="loader"></div>
          </div>
        </template>
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

.loader {
  height: 15px;
  aspect-ratio: 4;
  --_g: no-repeat radial-gradient(farthest-side, #eee 90%, #0000);
  background:
    var(--_g) left,
    var(--_g) right;
  background-size: 25% 100%;
  display: grid;
}
.loader:before,
.loader:after {
  content: "";
  height: inherit;
  aspect-ratio: 1;
  grid-area: 1/1;
  margin: auto;
  border-radius: 50%;
  transform-origin: -100% 50%;
  background: #eee;
  animation: l49 1s infinite linear;
}
.loader:after {
  transform-origin: 200% 50%;
  --s: -1;
  animation-delay: -0.5s;
}

@keyframes l49 {
  58%,
  100% {
    transform: rotate(calc(var(--s, 1) * 1turn));
  }
}
</style>
