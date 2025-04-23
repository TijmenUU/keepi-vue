<script setup lang="ts">
import { areDatesEqual, formatDateAsTwoLetterDayName } from "@/date";
import { computed } from "vue";

const props = defineProps<{
  date: Date;
}>();

const shortDayName = computed<string>(() => {
  const name = formatDateAsTwoLetterDayName(props.date);
  return `${name[0].toUpperCase()}${name[1]}`;
});

const dayMonth = computed<string>(() => {
  const day = props.date.getDate();
  const month = props.date.getMonth() + 1;
  return `${day}-${month}`;
});

const isToday = computed<boolean>(() => areDatesEqual(props.date, new Date()));
</script>

<template>
  <div class="text-center" :class="{ 'text-blue-500': isToday }">
    {{ shortDayName }}
    <span class="align-top text-xs font-normal text-gray-500">
      {{ dayMonth }}
    </span>
  </div>
</template>
