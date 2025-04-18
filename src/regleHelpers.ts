import type { RegleFieldStatus } from "@regle/core";
import {
  computed,
  ref,
  unref,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from "vue";

export function useCustomFieldError<TValue>(options: {
  forceShowError: MaybeRef<boolean>;
  regleFieldStatus: MaybeRef<RegleFieldStatus<TValue>>;
}): {
  hadFocus: Ref<boolean>;
  onBlur: () => void;
  showError: ComputedRef<boolean>;
  errorToShow: ComputedRef<string>;
} {
  const hadFocus = ref<boolean>(false);
  const onBlur = () => (hadFocus.value = true);

  const showError = computed<boolean>(
    () =>
      (hadFocus.value || unref(options.forceShowError)) &&
      (unref(options.regleFieldStatus)?.$error ?? false),
  );

  const errorToShow = computed<string>(
    () => unref(options.regleFieldStatus)?.$errors.find((e) => !!e) ?? "",
  );

  return { hadFocus, onBlur, showError, errorToShow };
}

export function useCustomSubmit(options: { submitCallback: () => void }): {
  forceShowError: Ref<boolean>;
  onSubmit: () => Promise<void>;
} {
  const forceShowError = ref(false);

  const onSubmit = async () => {
    forceShowError.value = true;

    if (options.submitCallback != null) {
      options.submitCallback();
    }
  };

  return { forceShowError, onSubmit };
}
