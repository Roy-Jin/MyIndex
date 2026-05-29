<template>
    <Teleport to="body">
        <AnimatePresence>
            <motion.div v-if="show" key="v-dialog-overlay" class="v-dialog-overlay" @click="onOverlayClick"
                :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }"
                :transition="{ duration: 0.2, ease: 'easeInOut' }">
                <motion.div key="v-dialog" class="v-dialog" @click.stop :initial="{ scale: 0.8, opacity: 0, y: 20 }"
                    :animate="{ scale: 1, opacity: 1, y: 0 }" :exit="{ scale: 0.8, opacity: 0, y: 20 }" :transition="{
                        default: {
                            duration: 0.2, ease: 'easeInOut',
                        },
                        layout: {
                            type: 'spring', visualDuration: 0.2, bounce: 0.5
                        }
                    }" layout="position">
                    <div v-if="title || $slots.title" class="v-dialog__title">
                        <slot name="title">{{ title }}</slot>
                    </div>
                    <div class="v-dialog__message">
                        <slot>{{ message }}</slot>
                    </div>
                    <div v-if="$slots.actions" class="v-dialog__footer" @click.stop>
                        <slot name="actions"></slot>
                    </div>
                    <div v-else class="v-dialog__footer">
                        <button v-if="showCancelButton" class="v-dialog__btn v-dialog__btn--cancel"
                            :style="{ color: cancelButtonColor }" @click="onCancel">
                            {{ cancelButtonText || t('tips.cancel') }}
                        </button>
                        <button class="v-dialog__btn v-dialog__btn--confirm" :style="{ color: confirmButtonColor }"
                            @click="onConfirm">
                            {{ confirmButtonText || t('tips.confirm') }}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    </Teleport>
</template>

<script setup lang="ts">
import { motion, AnimatePresence } from 'motion-v';
import { useI18n } from 'vue-i18n';
import { ref, watch, onUnmounted } from 'vue';
import { pushEscHandler, popEscHandler } from '@/utils';

const { t } = useI18n();

const props = withDefaults(defineProps<{
    show?: boolean;
    title?: string;
    message?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    closeOnClickOverlay?: boolean;
    showCancelButton?: boolean;
}>(), {
    show: false,
    title: '',
    message: '',
    confirmButtonText: '',
    cancelButtonText: '',
    confirmButtonColor: 'var(--theme-color)',
    cancelButtonColor: '',
    closeOnClickOverlay: false,
    showCancelButton: true,
});

const emit = defineEmits<{
    'update:show': [value: boolean];
    'confirm': [];
    'cancel': [];
}>();

const isClosing = ref(false);

watch(() => props.show, (val) => {
    if (val) {
        isClosing.value = false;
        pushEscHandler(onCancel);
    } else {
        popEscHandler();
    }
});

onUnmounted(() => {
    popEscHandler();
});

const showDialog = () => {
    emit('update:show', true);
};

const hideDialog = () => {
    emit('update:show', false);
};

const onConfirm = () => {
    if (isClosing.value) return;
    isClosing.value = true;
    emit('confirm');
    hideDialog();
};

const onCancel = () => {
    if (isClosing.value) return;
    isClosing.value = true;
    emit('cancel');
    hideDialog();
};

const onOverlayClick = () => {
    if (isClosing.value) return;
    if (props.closeOnClickOverlay) {
        onCancel();
    }
};

defineExpose({
    showDialog,
    hideDialog,
});
</script>

<style scoped>
.v-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: var(--filter-blur, blur(20px));
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: opacity;
}

.v-dialog {
    background: var(--main-bg);
    border-radius: 16px;
    max-width: 85%;
    width: 20rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    will-change: transform, opacity;
}

.v-dialog__title {
    padding: 24px 20px 8px;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    color: var(--text-color);
}

.v-dialog__message {
    padding: 8px 20px 24px;
    font-size: 0.9rem;
    text-align: center;
    color: var(--text-color);
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
}

.v-dialog__footer {
    display: flex;
    border-top: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
}

.v-dialog__btn {
    flex: 1;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
}

.v-dialog__btn:active {
    background: color-mix(in srgb, var(--text-color) 10%, transparent);
}

.v-dialog__btn--cancel {
    border-right: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
}

.v-dialog__btn--confirm {
    font-weight: 600;
}
</style>