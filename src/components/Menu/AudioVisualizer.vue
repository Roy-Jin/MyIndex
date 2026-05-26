<template>
    <div class="audio-visualizer" :class="{ visible: global.music.isPlaying }">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGlobal } from '@/stores/global';
import { getCSSColor } from '@/utils/index';

const global = useGlobal();
const canvasRef = ref<HTMLCanvasElement | null>(null);

let audioCtx: AudioContext | null = null;
let source: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let animationId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let isInitialized = false;

const MAX_BAR_COUNT = 128;
const MIN_BAR_WIDTH = 2.5;
const MIN_BAR_SPACING = 1;
const MIN_BAR_PITCH = 12;
const SMOOTHING = 0.95;

const initAudio = () => {
    const audio = global.music.audio;
    if (!audio || !canvasRef.value || isInitialized) return;

    try {
        const existing = (audio as any).__avState;
        if (existing) {
            audioCtx = existing.audioCtx;
            source = existing.source;
            analyser = existing.analyser;
        } else {
            audioCtx = new AudioContext();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = SMOOTHING;

            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);

            (audio as any).__avState = { audioCtx, source, analyser };
        }

        if (audioCtx?.state === 'suspended') {
            audioCtx.resume();
        }

        isInitialized = true;
        startAnimation();
    } catch (error) {
        console.error('[AudioVisualizer]', error);
    }
};

const startAnimation = () => {
    if (!analyser || !canvasRef.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx!.scale(dpr, dpr);
    };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const draw = () => {
        animationId = requestAnimationFrame(draw);

        analyser!.getByteFrequencyData(dataArray);

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        ctx!.clearRect(0, 0, width, height);

        const themeColor = global.music.themeColor || getCSSColor('--theme-color');
        const textColor = getCSSColor('--text-color');

        const availableWidth = width;
        const maxBarsThatFit = Math.floor((availableWidth + MIN_BAR_SPACING) / (MIN_BAR_WIDTH + MIN_BAR_SPACING));
        const maxBarsByDensity = Math.max(32, Math.floor(availableWidth / MIN_BAR_PITCH));
        const effectiveBarCount = Math.min(MAX_BAR_COUNT, maxBarsThatFit, maxBarsByDensity);

        const actualBarWidth = (availableWidth - MIN_BAR_SPACING * (effectiveBarCount - 1)) / effectiveBarCount;
        const barWidth = actualBarWidth;
        const barSpacing = MIN_BAR_SPACING;

        const glyphWidth = barWidth + barSpacing;
        const halfCount = Math.floor(effectiveBarCount / 2);
        const step = bufferLength / effectiveBarCount;

        for (let side = 0; side <= 1; side++) {
            for (let i = 0; i < halfCount; i++) {
                const dataIndex = Math.min(Math.floor(i * step), bufferLength - 1);
                const value = dataArray[dataIndex] ?? 0;

                const barHeight = (value / 255) * height * 0.85;

                if (barHeight < 1) continue;

                let x: number;
                if (side === 0) {
                    x = width / 2 - barSpacing / 2 - barWidth - (halfCount - 1 - i) * glyphWidth;
                } else {
                    x = width / 2 + barSpacing / 2 + (halfCount - 1 - i) * glyphWidth;
                }

                const y = height - barHeight;
                const normPos = i / halfCount;
                const alpha = 0.35 - normPos * 0.25;
                const baseColor = `color-mix(in srgb, ${themeColor}, ${textColor} 60%)`;

                const gradient = ctx!.createLinearGradient(x, height, x, y);
                gradient.addColorStop(0, `color-mix(in srgb, ${baseColor} ${alpha * 100}%, transparent)`);
                gradient.addColorStop(1, `color-mix(in srgb, ${baseColor} ${alpha * 15}%, transparent)`);
                ctx!.fillStyle = gradient;

                ctx!.beginPath();
                const r = Math.max(barWidth / 2, 1);
                ctx!.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]);
                ctx!.fill();
            }
        }
    };

    draw();
};

const cleanup = () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    isInitialized = false;
};

onMounted(() => {
    if (global.music.audio && global.music.isPlaying) {
        initAudio();
    }
});

onUnmounted(() => {
    cleanup();
});

watch(() => global.music.audio, (audio) => {
    if (audio && global.music.isPlaying && !isInitialized) {
        initAudio();
    }
});

watch(() => global.music.isPlaying, (playing) => {
    if (playing && global.music.audio && !isInitialized) {
        initAudio();
    } else if (!playing && isInitialized) {
        if (canvasRef.value) {
            const canvas = canvasRef.value;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const dpr = window.devicePixelRatio || 1;
                const width = canvas.width / dpr;
                const height = canvas.height / dpr;
                ctx.clearRect(0, 0, width, height);
            }
        }
    }
});
</script>

<style scoped>
.audio-visualizer {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.8s ease;
    pointer-events: none;
    z-index: 0;
}

.audio-visualizer.visible {
    opacity: 1;
}

canvas {
    width: 100%;
    height: 100%;
    display: block;
}
</style>