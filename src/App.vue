<script setup lang="ts">
import TimeTable, { saveEntry } from "@/components/TimeTable.vue";

const initialValues: saveEntry[] = [
  {
    category: "ROB-Net",
    day: "maandag",
    minutes: 420,
  },
];
</script>

<template>
  <TimeTable
    :input-categories="['ROB-Net', 'Borrel', 'Vakantie', 'Feestdag']"
    :initial-values="initialValues"
    @save="console.log($event)"
  />
</template>
