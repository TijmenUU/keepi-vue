<script setup lang="ts">
import MenuLink from "@/components/MenuLink.vue";
</script>

<template>
  <nav class="border-gray-200 bg-white dark:bg-gray-900">
    <div
      class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4"
    >
      <router-link
        to="/"
        class="flex items-center space-x-3 rtl:space-x-reverse"
      >
        <img src="/keepi.svg" class="h-8" alt="Keepi Logo" />
        <span
          class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white"
          >Keepi</span
        >
      </router-link>

      <div class="block w-auto" id="navbar-default">
        <div
          class="mt-0 flex flex-row space-x-8 rounded-lg border border-gray-100 bg-white p-4 font-medium md:border-0 md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-900"
        >
          <MenuLink route="/"> Invoer </MenuLink>
          <MenuLink route="/categories"> Categorieën </MenuLink>
          <MenuLink route="/setup"> Token </MenuLink>
        </div>
      </div>
    </div>
  </nav>
</template>
