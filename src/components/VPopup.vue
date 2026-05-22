<template>
    <Teleport :to="teleportTo">
        <AnimatePresence>
            <motion.div v-if="show" key="v-popup-overlay" class="v-popup-overlay" @click="onOverlayClick"
                :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }"
                :transition="{ duration: 0.25, ease: 'easeInOut' }">
                <motion.div :key="`v-popup-${position}`" class="v-popup"
                    :class="[`v-popup--${position}`, { 'v-popup--round': round }]" :style="popupStyle" @click.stop
                    :initial="position === 'bottom' ? { y: '100%', opacity: 0 } : position === 'top' ? { y: '-100%', opacity: 0 } : { scale: 0.85, opacity: 0 }"
                    :animate="{ y: 0, scale: 1, opacity: 1 }"
                    :exit="position === 'bottom' ? { y: '100%', opacity: 0 } : position === 'top' ? { y: '-100%', opacity: 0 } : { scale: 0.85, opacity: 0 }"
                    :transition="{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }">
                    <motion.button v-if="closeable" class="v-popup__close" @click="close" @pointerdown.stop
                        :whileHover="{ scale: 1.1 }" :whileTap="{ scale: 0.9 }"
                        :transition="{ type: 'spring', stiffness: 500, damping: 25 }">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </motion.button>
                    <slot />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { AnimatePresence, motion } from 'motion-v';

const props = withDefaults(defineProps<{
    show?: boolean;
    position?: 'bottom' | 'top' | 'center';
    round?: boolean;
    closeable?: boolean;
    teleportTo?: string;
    lockScroll?: boolean;
    closeOnClickOverlay?: boolean;
}>(), {
    show: false,
    position: 'bottom',
    round: false,
    closeable: false,
    teleportTo: 'body',
    lockScroll: true,
    closeOnClickOverlay: true,
});

const emit = defineEmits<{
    'update:show': [value: boolean];
    'close': [];
}>();

const popupStyle = computed(() => {
    if (props.position === 'center') {
        return { height: '90%', overflow: 'hidden' };
    }
    return {};
});

watch(() => props.show, (val) => {
    if (props.lockScroll && val) {
        document.body.style.overflow = 'hidden';
    } else if (props.lockScroll && !val) {
        document.body.style.overflow = '';
    }
});

const onOverlayClick = () => {
    if (props.closeOnClickOverlay) {
        close();
    }
};

const close = () => {
    emit('update:show', false);
    emit('close');
};
</script>

<style scoped>
.v-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: var(--filter-blur, blur(20px));
    z-index: 2000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.v-popup {
    position: relative;
    background: var(--main-bg, #fff);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
    width: 100%;
    height: 90%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.v-popup--round {
    border-radius: 16px 16px 0 0;
}

.v-popup--center {
    border-radius: 16px;
    max-width: 85%;
    width: auto;
    min-width: 280px;
    max-height: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.v-popup--center.v-popup--round {
    border-radius: 16px;
}

.v-popup--top {
    align-self: flex-start;
    border-radius: 0 0 16px 16px;
}

.v-popup--top.v-popup--round {
    border-radius: 0 0 16px 16px;
}

.v-popup__close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: color-mix(in srgb, var(--text-color) 8%, transparent);
    border-radius: 50%;
    color: var(--text-color);
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
}

.v-popup__close:hover {
    background: color-mix(in srgb, var(--text-color) 16%, transparent);
}
</style>