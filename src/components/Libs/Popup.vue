<template>
    <Teleport to="body">
        <div v-if="isVisible" class="v-popup-wrapper" :class="{ 'v-popup--active': isActive }">
            <div class="v-popup-overlay" @click="onOverlayClick" />
            <div class="v-popup" :class="[`v-popup--${position}`, { 'v-popup--round': round }]"
                :style="{ height: position === 'center' ? '90%' : undefined, overflow: position === 'center' ? 'hidden' : undefined }"
                @click.stop>
                <button v-if="closeable" class="v-popup__close" @click="close" @pointerdown.stop"
                    :target-title="t('tips.close')">
                    <XIcon scale="20" />
                </button>
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { pushEscHandler, popEscHandler } from '@/utils';
import { useI18n } from 'vue-i18n';
import { XIcon } from '@lucide/vue';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    show?: boolean;
    position?: 'bottom' | 'top' | 'center';
    round?: boolean;
    closeable?: boolean;
    lockScroll?: boolean;
    closeOnClickOverlay?: boolean;
}>(), {
    show: false,
    position: 'bottom',
    round: false,
    closeable: false,
    lockScroll: true,
    closeOnClickOverlay: true,
});

const emit = defineEmits<{
    'update:show': [value: boolean];
    'close': [];
}>();

const isVisible = ref(false);
const isActive = ref(false);

watch(() => props.show, async (val) => {
    if (val) {
        isVisible.value = true;
        await nextTick();
        requestAnimationFrame(() => {
            isActive.value = true;
        });
        if (props.lockScroll) {
            document.body.style.overflow = 'hidden';
        }
        pushEscHandler(close);
    } else {
        isActive.value = false;
        popEscHandler();
        setTimeout(() => {
            isVisible.value = false;
            if (props.lockScroll) {
                document.body.style.overflow = '';
            }
        }, 200);
    }
});

onUnmounted(() => {
    popEscHandler();
    document.body.style.overflow = '';
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
.v-popup-wrapper {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.v-popup-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: var(--filter-blur, blur(20px));
    will-change: opacity;
    transform: translateZ(0);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.v-popup--active .v-popup-overlay {
    opacity: 1;
}

.v-popup {
    position: relative;
    background: var(--main-bg, #fff);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: column;
    z-index: 1;
    will-change: transform;
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

.v-popup--bottom {
    --popup-transform: translateY(100%);
}

.v-popup--top {
    --popup-transform: translateY(-100%);
}

.v-popup--center {
    --popup-transform: scale(0.85);
}

.v-popup {
    transform: var(--popup-transform);
    transition: transform 0.2s ease-in-out;
}

.v-popup--active .v-popup {
    transform: none;
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
    will-change: transform;
    transform: translateZ(0);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.v-popup__close:hover {
    transform: scale(1.2) translateZ(0);
}

.v-popup__close:active {
    transform: scale(0.9) translateZ(0);
}
</style>