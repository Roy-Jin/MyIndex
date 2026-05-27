<template>
    <div v-html="qrCode" class="qr-code cursor-target" :style="{
        '--qr-fill': props.opts?.color || 'var(--text-color)',
        '--qr-bg': props.opts?.background || 'transparent'
    }"></div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue';
import encodeQR, { type QrOpts, type SvgQrOpts } from 'qr';

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