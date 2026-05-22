<template>
    <Teleport to="body">
        <AnimatePresence>
            <motion.div v-if="show" key="v-dialog-overlay" class="v-dialog-overlay" @click="onOverlayClick"
                :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0 }"
                :transition="{ duration: 0.2, ease: 'easeInOut' }">
                <motion.div key="v-dialog" class="v-dialog" @click.stop :initial="{ scale: 0.8, opacity: 0, y: 20 }"
                    :animate="{ scale: 1, opacity: 1, y: 0 }" :exit="{ scale: 0.8, opacity: 0, y: 20 }"
                    :transition="{ type: 'spring', stiffness: 450, damping: 32, mass: 0.7 }">
                    <div v-if="title" class="v-dialog__title">{{ title }}</div>
                    <div class="v-dialog__message">{{ message }}</div>
                    <div class="v-dialog__footer">
                        <motion.button v-if="showCancelButton" class="v-dialog__btn v-dialog__btn--cancel"
                            :style="{ color: cancelButtonColor }" @click="onCancel" :transition="{ type: 'spring', stiffness: 500, damping: 25 }">
                            {{ cancelButtonText || t('tips.cancel') }}
                        </motion.button>
                        <motion.button class="v-dialog__btn v-dialog__btn--confirm"
                            :style="{ color: confirmButtonColor }" @click="onConfirm" :transition="{ type: 'spring', stiffness: 500, damping: 25 }">
                            {{ confirmButtonText || t('tips.confirm') }}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    </Teleport>
</template>

<script setup lang="ts">
import { motion, AnimatePresence } from 'motion-v';
import { useI18n } from 'vue-i18n';

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

const showDialog = () => {
    emit('update:show', true);
};

const hideDialog = () => {
    emit('update:show', false);
};

const onConfirm = () => {
    emit('confirm');
    hideDialog();
};

const onCancel = () => {
    emit('cancel');
    hideDialog();
};

const onOverlayClick = () => {
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
}

.v-dialog {
    background: var(--main-bg, #fff);
    border-radius: 16px;
    max-width: 85%;
    width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
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
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
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