<template>
    <motion.div drag :dragConstraints="{ left: 0, right: 0, top: 0, bottom: 0 }" :dragElastic="1"
        :dragTransition="{ bounceStiffness: 600, bounceDamping: 20 }" class="avatar-container cursor-target"
        :target-title="kaomoji" @mouseenter="startCycling" @mouseleave="stopCycling">
        <svg class="avatar" width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="circleClip">
                    <circle cx="100" cy="100" r="100" />
                </clipPath>
            </defs>
            <foreignObject x="0" y="0" width="200" height="200" clip-path="url(#circleClip)">
                <div xmlns="http://www.w3.org/1999/xhtml" style="position: relative; width: 200px; height: 200px;">
                    <img :src="env.avatar[0]" style="width: 200px; height: 200px; object-fit: cover;" />
                    <video v-if="env.avatar_video" width="200" height="200" autoplay loop muted playsinline
                        disablepictureinpicture disableremoteplayback
                        style="width: 200px; height: 200px; position: absolute; top: 0; left: 0; object-fit: cover; border-radius: 50%;"
                        controlslist="nodownload nofullscreen noremoteplayback">
                        <source :src="env.avatar_video" type="video/webm" />
                    </video>
                    <div
                        style="position: absolute; top: 0; left: 0; width: 200px; height: 200px; pointer-events: none;">
                    </div>
                </div>
            </foreignObject>
        </svg>
    </motion.div>
</template>

<script setup lang='ts'>
import { useEnv } from '@/stores/env';
import { motion } from 'motion-v';
import { onMounted, onUnmounted, ref } from 'vue';

const env = useEnv();
const kaomoji = ref("");
let intervalId: ReturnType<typeof setInterval>;

const pickNextEmo = () => {
    const candidates = env.kaomoji.values.filter(e => e !== kaomoji.value);
    if (candidates.length === 0) return;
    kaomoji.value = candidates[Math.floor(Math.random() * candidates.length)] || "";
};

const startCycling = () => {
    stopCycling();
    intervalId = setInterval(pickNextEmo, env.kaomoji.timeout);
};

const stopCycling = () => {
    clearInterval(intervalId);
};

onMounted(() => {
    pickNextEmo();
});

onUnmounted(() => {
    stopCycling();
});
</script>

<style scoped>
.avatar-container {
    max-width: 66%;
    border-radius: 50%;
    overflow: hidden;
    cursor: none !important;

    .avatar {
        width: 100%;
        height: 100%;
    }
}
</style>
