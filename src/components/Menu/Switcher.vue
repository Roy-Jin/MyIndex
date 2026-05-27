<template>
    <motion.div class="switcher" @click="handleClick" @mouseenter="isHovered = true" @mouseleave="isHovered = false"
        :animate="containerAnim" :whileTap="{ scale: 0.98 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 30 }">
        <motion.div class="shine-effect" :animate="{ left: isHovered ? '100%' : '-100%' }"
            :transition="{ duration: 0.6, ease: 'easeInOut' }" />
        <div class="icon-wrapper">
            <motion.div class="icon-circle" :initial="{ scale: 1, rotate: 0 }" :animate="circleAnim"
                :transition="circleTransition">
                <motion.div :key="clickCount" :initial="iconInitial" :animate="{ rotate: 0, scale: 1, opacity: 1 }"
                    :transition="{ type: 'spring', stiffness: 200, damping: 15 }">
                    <component :is="icon" class="switcher-icon" />
                </motion.div>
            </motion.div>
        </div>
        <div class="switcher-text">
            <span class="label">{{ label }}</span>
            <span class="value">{{ value }}</span>
        </div>
        <motion.div class="arrow" :animate="{ x: isHovered ? 4 : 0 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 15 }">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
            </svg>
        </motion.div>
    </motion.div>
</template>

<script setup lang='ts'>
import { ref, computed, type FunctionalComponent } from 'vue';
import { motion } from 'motion-v';

const props = defineProps<{
    icon: FunctionalComponent;
    label: string;
    value: string;
}>();

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
}>();

const isHovered = ref(false);
const isAnimating = ref(false);
const clickCount = ref(0);

const containerAnim = computed(() => ({
    borderColor: isHovered.value ? 'var(--theme-color)' : 'transparent',
    boxShadow: isHovered.value
        ? '0 8px 24px color-mix(in srgb, var(--theme-color) 20%, transparent)'
        : '0 0 0 transparent',
}));

const circleAnim = computed(() => {
    if (isAnimating.value) {
        return { scale: [1, 1.15, 1] };
    }
    return { scale: isHovered.value ? 1.1 : 1, rotate: isHovered.value ? 10 : 0 };
});

const circleTransition = computed(() => {
    if (isAnimating.value) {
        return { duration: 0.4, ease: 'easeInOut' as const };
    }
    return { type: 'spring' as const, stiffness: 300, damping: 15 };
});

const iconInitial = computed(() => {
    if (clickCount.value === 0) {
        return { rotate: 0, scale: 1, opacity: 1 };
    }
    return { rotate: -180, scale: 0.5, opacity: 0 };
});

const handleClick = (event: MouseEvent) => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    clickCount.value++;
    emit('click', event);
    setTimeout(() => {
        isAnimating.value = false;
    }, 400);
};
</script>

<style scoped>
.switcher {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 16px;
    background: var(--theme-color-light);
    border: 2px solid transparent;
    width: 100%;
    position: relative;
    overflow: hidden;
    will-change: transform;

    .icon-wrapper {
        flex-shrink: 0;
    }

    .icon-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--theme-color) 15%, transparent);
        will-change: transform;

        .switcher-icon {
            width: 26px;
            height: 26px;
            color: var(--theme-color);
        }
    }

    .switcher-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .label {
            font-size: 0.85rem;
            opacity: 0.7;
            font-family: "Playball";
        }

        .value {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--text-color);
        }
    }

    .arrow {
        flex-shrink: 0;
        color: var(--theme-color);
        opacity: 0.6;
        will-change: transform;
    }

    .shine-effect {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-color) 10%, transparent), transparent);
    }
}

@media screen and (max-width: 768px) {
    .switcher {
        padding: 0.85rem 1rem;
        gap: 0.85rem;

        .icon-circle {
            width: 42px;
            height: 42px;

            .switcher-icon {
                width: 22px;
                height: 22px;
            }
        }

        .switcher-text {
            .value {
                font-size: 1.05rem;
            }
        }
    }
}
</style>