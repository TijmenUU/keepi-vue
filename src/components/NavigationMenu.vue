<script setup lang="ts">
import MenuLink from "@/components/MenuLink.vue";
</script>

<template>
  <nav class="border-gray-200 bg-gray-900">
    <div
      class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4"
    >
      <router-link
        to="/"
        class="flex items-center space-x-3 rtl:space-x-reverse"
      >
        <img src="/keepi.svg" class="h-8" alt="Keepi Logo" />
        <span
          class="self-center whitespace-nowrap text-2xl font-semibold text-white"
          >Keepi</span
        >
      </router-link>

      <div class="block w-auto" id="navbar-default">
        <div
          class="mt-0 flex flex-row space-x-8 rounded-lg border-0 border-gray-700 bg-gray-900 p-0 font-medium rtl:space-x-reverse"
        >
          <MenuLink route="/"> Invoer </MenuLink>
          <MenuLink route="/categories"> Categorieën </MenuLink>
          <MenuLink route="/setup"> Token </MenuLink>
        </div>
      </div>
    </div>
  </nav>
</template>
