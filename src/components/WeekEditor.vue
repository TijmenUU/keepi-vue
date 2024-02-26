<script setup lang="ts">
import TimeTable, { TimeTableEntry } from "@/components/TimeTable.vue";
import { DateRange } from "@/date";
import { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { convertToTimeTableInput, getNokoCallsForDelta } from "@/transformer";
import { ref } from "vue";

const isSaving = ref(false);

const props = defineProps<{
  dateRange: DateRange;
  entries: INokoGetEntryResponse[];
  disabled: boolean;
}>();

const emits = defineEmits<{
  (e: "reload"): void;
}>();

const applicationStore = useApplicationStore();
const nokoClient = applicationStore.getNokoClient();

const categories = applicationStore.categories.map((m) => ({
  name: m.name,
  archived: m.archived,
}));

let initialValues: TimeTableEntry[] = convertToTimeTableInput(
  props.dateRange.dates,
  applicationStore.categories,
  props.entries,
);

const onSave = async (userInput: TimeTableEntry[]): Promise<void> => {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  let madeChanges = false;
  try {
    const delta = getNokoCallsForDelta(
      props.dateRange.dates,
      applicationStore.categories,
      props.entries,
      userInput,
    );
    for (let i = 0; i < delta.creates.length; ++i) {
      console.debug("Creating Noko entry", delta.creates[i]);
      await nokoClient.createEntry(delta.creates[i]);
      madeChanges = true;
    }
    for (let i = 0; i < delta.updates.length; ++i) {
      console.debug("Updating Noko entry", delta.updates[i]);
      await nokoClient.updateEntry(delta.updates[i].id, delta.updates[i].body);
      madeChanges = true;
    }
    for (let i = 0; i < delta.idsToDelete.length; ++i) {
      console.debug("Deleting Noko entry", delta.idsToDelete[i]);
      await nokoClient.deleteEntry(delta.idsToDelete[i]);
      madeChanges = true;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
  }

  if (madeChanges) {
    emits("reload");
  }
};
</script>

<template>
  <div
    class="relative transition duration-200"
    :class="{ 'blur-sm': isSaving || props.disabled }"
  >
    <div
      class="absolute left-0 top-0 z-10 h-full w-full cursor-not-allowed"
      v-if="isSaving || props.disabled"
    ></div>

    <TimeTable
      :input-categories="categories"
      :initial-values="initialValues"
      @save="onSave"
    />
  </div>
</template>
