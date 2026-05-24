<template>
    <motion.div :key="props.value" :initial="{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }"
        :animate="{ opacity: 1, scale: 1, filter: 'blur(0px)' }"
        :transition="{ type: 'spring', stiffness: 180, damping: 22, mass: 0.7 }" v-html="qrCode"
        class="qr-code cursor-target" :style="{
            '--qr-fill': props.opts?.color || 'var(--text-color)',
            '--qr-bg': props.opts?.background || 'transparent'
        }"></motion.div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue';
import encodeQR, { type QrOpts, type SvgQrOpts } from 'qr';
import { motion } from 'motion-v';

type QrComponentOpts = QrOpts & SvgQrOpts & {
    color?: string;
    background?: string;
};

const props = defineProps<{
    value: string;
    opts?: QrComponentOpts;
}>();

const qrCode = ref('');

onMounted(() => {
    qrCode.value = encodeQR(props.value, "svg", props.opts);
});

watch(() => props.value, (newVal) => {
    qrCode.value = encodeQR(newVal, "svg", props.opts);
});
</script>

<style scoped>
.qr-code {
    fill: var(--qr-fill);
    background: var(--qr-bg);
    cursor: none !important;
    transform-style: preserve-3d;
    backface-visibility: hidden;
}
</style>