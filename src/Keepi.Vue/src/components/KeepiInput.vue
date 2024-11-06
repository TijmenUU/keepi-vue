<script setup lang="ts">
import {
  getOptionalTimeInputValidationMessage,
  getRequiredInputValidationMessage,
} from "@/validation";
import { computed, useAttrs } from "vue";
import Popper from "vue3-popper";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    name?: string;
    type?: "text" | "number";
    modelValue: string;
    readonly?: boolean;
    tabIndex?: 0 | -1;
    autofocus?: boolean;
    inputValidation?: "required" | "optional-time";
  }>(),
  {
    name: "",
    type: "text",
    readonly: false,
    tabIndex: 0,
    autofocus: false,
    inputValidation: undefined,
  },
);

const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "keyup", value: KeyboardEvent): void;
}>();

const validationMessage = computed<string>(() => {
  if (props.inputValidation == null) {
    return "";
  } else if (props.inputValidation == "required") {
    return getRequiredInputValidationMessage(props.modelValue);
  } else if (props.inputValidation == "optional-time") {
    return getOptionalTimeInputValidationMessage(props.modelValue);
  } else {
    console.warn(
      `Unknown input validation type ${props.inputValidation} for input with name ${props.name}`,
    );
  }

  return "";
});
</script>

<template>
  <Popper
    :content="validationMessage"
    :show="!!validationMessage"
    placement="top"
    class="error-popup"
    arrow
    open-delay="100"
    close-delay="100"
  >
    <input
      class="rounded border-b bg-gray-800 ring-gray-400 focus:outline-none focus:ring-2"
      :class="{
        'border-gray-600': !validationMessage,
        'border-red-600': validationMessage,
      }"
      :name="props.name"
      :type="props.type"
      :value="props.modelValue"
      :autofocus="props.autofocus"
      v-bind="useAttrs()"
      @input="
        emits(
          'update:modelValue',
          ($event.target as HTMLInputElement)?.value ?? '',
        )
      "
      @keyup="emits('keyup', $event)"
      :readonly="props.readonly"
      :tabindex="props.tabIndex"
    />
  </Popper>
</template>
