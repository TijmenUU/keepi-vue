<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import WeekEditorNew from "@/components/WeekEditorNew.vue";
import { type DateRange, getWeekDaysFor, getWeekNumber } from "@/date";
import { toShortDutchDate } from "@/format";
import { saveChangesToNoko } from "@/nokoHelpers";
import type { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { loggableDays } from "@/types";
import { computed, ref } from "vue";

const editorVersion = ref(0);
const disableUserInteraction = ref(false);
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

const fetchNokoEntriesAndRefreshEditor = async (): Promise<void> => {
  entries.value = await nokoClient.getEntries(
    dateRange.value.dates[0],
    dateRange.value.dates[dateRange.value.dates.length - 1],
  );
  editorVersion.value += 1;
};
await fetchNokoEntriesAndRefreshEditor();

const onPreviousWeek = async () => {
  disableUserInteraction.value = true;

  try {
    const lastDatePreviousWeek = new Date(dateRange.value.dates[0]);
    lastDatePreviousWeek.setDate(lastDatePreviousWeek.getDate() - 1);
    startDate.value = lastDatePreviousWeek;

    await fetchNokoEntriesAndRefreshEditor();
  } finally {
    disableUserInteraction.value = false;
  }
};

const onToday = async () => {
  disableUserInteraction.value = true;

  try {
    startDate.value = new Date();
    await fetchNokoEntriesAndRefreshEditor();
  } finally {
    disableUserInteraction.value = false;
  }
};

const onNextWeek = async () => {
  disableUserInteraction.value = true;

  try {
    const firstDateNextWeek = new Date(
      dateRange.value.dates[dateRange.value.dates.length - 1],
    );
    firstDateNextWeek.setDate(firstDateNextWeek.getDate() + 1);
    startDate.value = firstDateNextWeek;

    await fetchNokoEntriesAndRefreshEditor();
  } finally {
    disableUserInteraction.value = false;
  }
};

const onSubmit = async (
  value: { categoryName: string; minutesPerDate: number[] }[],
) => {
  disableUserInteraction.value = true;

  try {
    await saveChangesToNoko({
      originalEntries: entries.value,
      categories: applicationStore.categories,
      desiredEntries: value.map((v) => ({
        categoryName: v.categoryName,
        minutesPerDate: v.minutesPerDate.map((minutes, index) => ({
          date: dateRange.value.dates[index],
          minutes: minutes,
        })),
      })),
      nokoClient: nokoClient,
    });
    await fetchNokoEntriesAndRefreshEditor();
  } finally {
    disableUserInteraction.value = false;
  }
};
</script>

<template>
  <div class="mx-auto max-w-full p-4">
    <div
      class="relative max-w-3xl flex-col items-center space-y-4 transition duration-200"
      :class="{ 'blur-xs': disableUserInteraction }"
    >
      <div
        class="absolute top-0 left-0 z-10 h-full w-full cursor-not-allowed"
        v-if="disableUserInteraction"
      ></div>

      <div class="flex justify-center space-x-2">
        <KeepiButton @click="onPreviousWeek">Vorige week</KeepiButton>
        <KeepiButton
          :disabled="currentWeek === dateRange.weekNumber"
          @click="onToday"
        >
          Toon vandaag
        </KeepiButton>
        <KeepiButton @click="onNextWeek">Volgende week</KeepiButton>
      </div>

      <div class="text-center">
        <h2 class="text-2xl">Week {{ dateRange.weekNumber }}</h2>
        <p class="text-gray-500">{{ dateRangeDescription }}</p>
      </div>

      <WeekEditorNew
        :noko-entries="entries"
        :date-range="dateRange"
        @submit="onSubmit"
        :key="editorVersion"
      />
    </div>
  </div>
</template>
