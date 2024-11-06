<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
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
      dateRange.value.dates[loggableDays.length - 1],
    )}`,
);

const onReload = async (): Promise<void> => {
  if (isReloading.value) {
    return;
  }

  isReloading.value = true;
  try {
    entries.value = await nokoClient.getEntries(
      dateRange.value.dates[0],
      dateRange.value.dates[dateRange.value.dates.length - 1],
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
    dateRange.value.dates[dateRange.value.dates.length - 1],
  );
  firstDateNextWeek.setDate(firstDateNextWeek.getDate() + 1);
  startDate.value = firstDateNextWeek;

  await onReload();
};
</script>

<template>
  <div class="mx-auto flex flex-col items-center py-3 lg:container">
    <h2 class="text-2xl">Week {{ dateRange.weekNumber }}</h2>

    <p class="text-gray-500">{{ dateRangeDescription }}</p>

    <div class="flex space-x-2 py-3">
      <KeepiButton @click="onPreviousWeek">Vorige</KeepiButton>
      <KeepiButton
        :disabled="currentWeek === dateRange.weekNumber"
        @click="onToday"
      >
        Vandaag
      </KeepiButton>
      <KeepiButton @click="onNextWeek">Volgende</KeepiButton>
    </div>

    <WeekEditor
      class="mt-3"
      :date-range="dateRange"
      :key="editorVersion"
      :entries="entries"
      :disabled="isReloading"
      @reload="onReload"
    />
  </div>
</template>
