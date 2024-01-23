<script setup lang="ts">
import TimeTable, { saveEntry } from "@/components/TimeTable.vue";
import { getWeekDaysFor } from "@/date";
import { toShortDutchDate } from "@/format";
import { loggableDays } from "@/types";
import { computed } from "vue";

const categories = ["ROB-Net", "Borrel", "Vakantie", "Feestdag"];

const dateRange = getWeekDaysFor(new Date());

const initialValues: saveEntry[] = [
  {
    category: "ROB-Net",
    day: "maandag",
    minutes: 420,
  },
];

const dateRangeDescription = computed<string>(
  () =>
    `${toShortDutchDate(dateRange.dates[0])} t/m ${toShortDutchDate(
      dateRange.dates[loggableDays.length - 1]
    )}`
);

const onSave = (entries: saveEntry[]) => {
  console.log(entries);
};
</script>

<template>
  <h2>Week {{ dateRange.weekNumber }}</h2>

  <p>{{ dateRangeDescription }}</p>

  <TimeTable
    :input-categories="categories"
    :initial-values="initialValues"
    @save="onSave"
  />
</template>
