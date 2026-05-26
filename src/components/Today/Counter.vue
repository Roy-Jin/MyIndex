<template>
    <div class="relative inline-block" :style="containerStyle">
        <div class="flex overflow-hidden" :style="counterStyles">
            <div v-for="place in places" :key="place" class="relative w-[1ch] tabular-nums" :style="digitStyles">
                <Motion v-for="digit in 10" :key="digit - 1" tag="span"
                    class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    :animate="{ y: getDigitPosition(place, digit - 1) }">
                    {{ digit - 1 }}
                </Motion>
            </div>
        </div>
        <div class="pointer-events-none absolute inset-0">
            <div class="absolute top-0 w-full" :style="topGradientStyle ?? topGradientStyles" />
            <div class="absolute bottom-0 w-full" :style="bottomGradientStyle ?? bottomGradientStyles" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties, onMounted, onUnmounted } from 'vue';
import { Motion } from 'motion-v';

interface CounterProps {
    value: number | string;
    fontSize?: number;
    padding?: number;
    places?: number[];
    borderRadius?: number;
    horizontalPadding?: number;
    textColor?: string;
    fontWeight?: string | number;
    containerStyle?: CSSProperties;
    counterStyle?: CSSProperties;
    digitStyle?: CSSProperties;
    gradientHeight?: number;
    gradientFrom?: string;
    gradientTo?: string;
    topGradientStyle?: CSSProperties;
    bottomGradientStyle?: CSSProperties;
}

interface MediaScreenRule {
    maxWidth: number;
    props: Partial<CounterProps>;
}

interface MediaScreenProps extends CounterProps {
    mediaScreen?: MediaScreenRule[];
}

const props = withDefaults(defineProps<MediaScreenProps>(), {
    fontSize: 16,
    padding: 0,
    places: () => [10, 1],
    borderRadius: 4,
    horizontalPadding: 0,
    textColor: 'var(--text-color)',
    fontWeight: 'normal',
    containerStyle: () => ({}),
    counterStyle: () => ({}),
    digitStyle: () => ({}),
    gradientHeight: 0,
    gradientFrom: 'transparent',
    gradientTo: 'transparent',
    mediaScreen: () => []
});

const currentScreenWidth = ref(window.innerWidth);
const activeMediaRule = ref<Partial<CounterProps> | null>(null);

const updateMediaQuery = () => {
    const screenWidth = window.innerWidth;
    currentScreenWidth.value = screenWidth;

    let matchedRule: Partial<CounterProps> | null = null;
    for (const rule of props.mediaScreen) {
        if (screenWidth <= rule.maxWidth) {
            matchedRule = rule.props;
            break;
        }
    }

    activeMediaRule.value = matchedRule;
};

const getPropValue = <T>(propName: keyof CounterProps, defaultValue: T): T => {
    if (activeMediaRule.value && activeMediaRule.value[propName] !== undefined) {
        return activeMediaRule.value[propName] as T;
    }
    return (props as any)[propName] ?? defaultValue;
};

const fontSize = computed(() => getPropValue('fontSize', 16));
const padding = computed(() => getPropValue('padding', 0));
const places = computed(() => getPropValue('places', [10, 1]));
const borderRadius = computed(() => getPropValue('borderRadius', 4));
const horizontalPadding = computed(() => getPropValue('horizontalPadding', 8));
const textColor = computed(() => getPropValue('textColor', 'var(--text-color)'));
const fontWeight = computed(() => getPropValue('fontWeight', 'normal'));
const gradientHeight = computed(() => getPropValue('gradientHeight', 0));
const gradientFrom = computed(() => getPropValue('gradientFrom', 'transparent'));
const gradientTo = computed(() => getPropValue('gradientTo', 'transparent'));

const digitHeight = computed(() => fontSize.value + padding.value);

const counterStyles = computed(() => ({
    fontSize: `${fontSize.value}px`,
    borderRadius: `${borderRadius.value}px`,
    paddingLeft: `${horizontalPadding.value}px`,
    paddingRight: `${horizontalPadding.value}px`,
    color: textColor.value,
    fontWeight: fontWeight.value,
    ...getPropValue('counterStyle', {}),
    ...props.counterStyle
}));

const digitStyles = computed(() => ({
    height: `${digitHeight.value}px`,
    ...getPropValue('digitStyle', {}),
    ...props.digitStyle
}));

const topGradientStyles = computed(
    (): CSSProperties => ({
        height: `${gradientHeight.value}px`,
        background: `linear-gradient(to bottom, ${gradientFrom.value}, ${gradientTo.value})`
    })
);

const bottomGradientStyles = computed(
    (): CSSProperties => ({
        height: `${gradientHeight.value}px`,
        background: `linear-gradient(to top, ${gradientFrom.value}, ${gradientTo.value})`
    })
);

const springValues = ref<Record<number, number>>({});

const initializeSpringValues = () => {
    places.value.forEach(place => {
        springValues.value[place] = Math.floor(Number(props.value) / place);
    });
};

initializeSpringValues();

watch(
    () => props.value,
    (newValue, oldValue) => {
        [oldValue, newValue] = [Number(oldValue), Number(newValue)];
        if (newValue === oldValue) return;

        places.value.forEach(place => {
            const newRoundedValue = Math.floor(newValue / place);
            const oldRoundedValue = springValues.value[place];

            if (newRoundedValue !== oldRoundedValue) {
                springValues.value[place] = newRoundedValue;
            }
        });
    },
    { immediate: true }
);

watch(
    () => digitHeight.value,
    () => {
        positionCache.clear();
    }
);

watch(
    () => currentScreenWidth.value,
    () => {
        updateMediaQuery();
    }
);

const positionCache = new Map<string, number>();

const getDigitPosition = (place: number, digit: number): number => {
    const springValue = springValues.value[place] || 0;
    const cacheKey = `${place}-${digit}-${springValue}`;

    if (positionCache.has(cacheKey)) {
        return positionCache.get(cacheKey)!;
    }

    const placeValue = springValue % 10;
    const offset = (10 + digit - placeValue) % 10;
    let position = offset * digitHeight.value;

    if (offset > 5) {
        position -= 10 * digitHeight.value;
    }

    if (positionCache.size > 200) {
        const firstKey = positionCache.keys().next().value;
        if (typeof firstKey === 'string') {
            positionCache.delete(firstKey);
        }
    }

    positionCache.set(cacheKey, position);
    return position;
};

onMounted(() => {
    window.addEventListener('resize', updateMediaQuery);
    updateMediaQuery();
});

onUnmounted(() => {
    window.removeEventListener('resize', updateMediaQuery);
});
</script>