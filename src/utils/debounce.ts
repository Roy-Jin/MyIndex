import { type Ref, ref, watch } from "vue";

export function useDebouncedRef<T>(
    source: Ref<T>,
    delay: number = 300,
): { debounced: Ref<T>; cancel: () => void } {
    const debounced = ref(source.value) as Ref<T>;
    let timer: ReturnType<typeof setTimeout> | null = null;

    watch(source, (val) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            debounced.value = val;
        }, delay);
    });

    const cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return { debounced, cancel };
}
