<script setup lang="ts">
import WeekEditor from "@/components/WeekEditor.vue";
import { DateRange, getWeekDaysFor, getWeekNumber } from "@/date";
import { toShortDutchDate } from "@/format";
import { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { loggableDays } from "@/types";
import { computed, ref } from "vue";

const editorVersion = ref(0);
const isReloading = ref(false);
const startDate = ref(new Date());
const entries = ref<INokoGetEntryResponse[]>([]);

const applicationStore = useApplicationStore();
const nokoClient = applicationStore.getNokoClient();

const dateRange = computed<DateRange>(() => getWeekDaysFor(startDate.value));
const currentWeek = getWeekNumber(new Date());

const dateRangeDescription = computed<string>(
  () =>
    `${toShortDutchDate(dateRange.value.dates[0])} t/m ${toShortDutchDate(
      dateRange.value.dates[loggableDays.length - 1]
    )}`
);

const onReload = async (): Promise<void> => {
  if (isReloading.value) {
    return;
  }

  isReloading.value = true;
  try {
    entries.value = await nokoClient.getEntries(
      dateRange.value.dates[0],
      dateRange.value.dates[dateRange.value.dates.length - 1]
    );
    editorVersion.value += 1;
  } finally {
    isReloading.value = false;
  }
};
await onReload();

const onPreviousWeek = async () => {
  const lastDatePreviousWeek = new Date(dateRange.value.dates[0]);
  lastDatePreviousWeek.setDate(lastDatePreviousWeek.getDate() - 1);
  startDate.value = lastDatePreviousWeek;

  await onReload();
};

const onToday = async () => {
  startDate.value = new Date();
  await onReload();
};

const onNextWeek = async () => {
  const firstDateNextWeek = new Date(
    dateRange.value.dates[dateRange.value.dates.length - 1]
  );
  firstDateNextWeek.setDate(firstDateNextWeek.getDate() + 1);
  startDate.value = firstDateNextWeek;

  await onReload();
};
</script>

<template>
  <div>
    <h2>Week {{ dateRange.weekNumber }}</h2>

    <div style="display: flex; align-items: center; justify-content: center">
      <button @click="onPreviousWeek">Vorige</button>
      <button
        style="margin-left: 10px; margin-right: 10px"
        :disabled="currentWeek === dateRange.weekNumber"
        @click="onToday"
      >
        Vandaag
      </button>
      <button @click="onNextWeek">Volgende</button>
    </div>

    <p>{{ dateRangeDescription }}</p>

    <WeekEditor
      :date-range="dateRange"
      :key="editorVersion"
      :entries="entries"
      :disable="isReloading"
      @reload="onReload"
    />
  </div>
</template>
