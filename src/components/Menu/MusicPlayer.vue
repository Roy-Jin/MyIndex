<template>
    <div class="player cursor-target" :style="{ '--theme': global.music.themeColor }">
        <div class="top">
            <div class="cover-container" @click.stop="toggleCoverMode">
                <div class="vinyl-disc"
                    :class="{ 'rotating': global.music.isPlaying && !isStaticMode, 'hidden': isStaticMode }"></div>
                <img ref="coverImg" crossorigin="anonymous" :src="global.music.pic" :alt="global.music.name"
                    :class="{ 'rotating': global.music.isPlaying && !isStaticMode, 'static-mode': isStaticMode }">
                <div class="cover-center" :class="{ 'hidden': isStaticMode }"></div>
                <div class="cover-shadow"></div>
            </div>
            <div class="info-container">
                <div class="name-artist">
                    <div class="name">{{ global.music.name }}</div>
                    <div class="artist">{{ global.music.artist }}</div>
                </div>
                <div class="cur-lyric">{{ global.music.curLrc }}</div>
                <div class="progress-container">
                    <div class="cur-time">{{ formatTime(currentTime) }}</div>
                    <div class="progress-bar" @click.stop="seekTo">
                        <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                    <div class="total-time">{{ formatTime(duration) }}</div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="controls">
                <div class="control order" @click.stop="toggleOrder" :target-title="orderTitle">
                    <component :is="orderIcon" color="var(--text-color)" />
                </div>
                <div class="control prev" @click.stop="previousSong" :target-title="t('music.prev')">
                    <SkipBack color="var(--text-color)" />
                </div>
                <div class="control play" :class="{ 'playing': global.music.isPlaying }" @click.stop="togglePlay"
                    :target-title="playTitle">
                    <Play v-if="!global.music.isPlaying" class="icon" :fill="'var(--play-color)'" />
                    <Pause v-else class="icon" :fill="'var(--play-color)'" />
                </div>
                <div class="control next" @click.stop="nextSong" :target-title="t('music.next')">
                    <SkipForward color="var(--text-color)" />
                </div>
                <div class="control volume" @click.stop="toggleVolume" :target-title="volumeTitle">
                    <component :is="volumeIcon" color="var(--text-color)" />
                </div>
            </div>
        </div>
        <audio ref="audioRef" :src="global.music.url" @loadedmetadata="onLoadedMetadata" @timeupdate="updateProgress"
            @pause="upPause" @play="upPlay" @ended="nextSong" crossorigin="anonymous">
        </audio>
    </div>
</template>

<script setup lang='ts'>
import { Lrc } from 'lrc-kit';
import { useEnv } from "@/stores/env";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useGlobal } from '@/stores/global';
import { useI18n } from 'vue-i18n';
import { formatTime, getThemeColorFromImage } from "@/utils";
import {
    Repeat,
    Repeat1,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume1,
    Volume2,
    Shuffle,
    Volume
} from '@lucide/vue';

const env = useEnv();
const global = useGlobal();
const coverImg = ref<HTMLImageElement>();
const audioRef = ref<HTMLAudioElement | null>(null);
const { t } = useI18n();

const currentTime = ref(0);
const duration = ref(0);
const lyrics = ref<{ content: string; timestamp: number }[]>([]);
const currentVolume = ref(0.6);
const isStaticMode = ref(true);
const playTitle = computed(() => global.music.isPlaying ? t('music.pause') : t('music.play'));
const orderTitle = computed(() => {
    switch (global.music.order) {
        case 'random': return t('music.random');
        case 'single': return t('music.single');
        default: return t('music.loop');
    }
});
const volumeTitle = computed(() => {
    switch (currentVolume.value) {
        case 0.3: return "30%";
        case 0.6: return "60%";
        case 1: return "100%";
        default: return `${Math.round(currentVolume.value * 100)}%`;
    }
});

const emit = defineEmits(["play", "pause"]);

const progressPercentage = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

const orderIcon = computed(() => {
    switch (global.music.order) {
        case 'random': return Shuffle;
        case 'single': return Repeat1;
        default: return Repeat;
    }
});

const volumeIcon = computed(() => {
    if (currentVolume.value === 0.3) return Volume;
    if (currentVolume.value === 0.6) return Volume1;
    return Volume2;
});

const parseLrcUrl = async (url: string): Promise<{ content: string; timestamp: number }[]> => {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const lrc = Lrc.parse(text);
        if (lrc.lyrics.length === 0) throw new Error(t("music.noLyric"));
        return lrc.lyrics.filter(lyric => lyric.content.trim() !== '');
    } catch (error) {
        return [{ content: t("music.noLyric"), timestamp: 0 }];
    }
}

const updateProgress = () => {
    if (audioRef.value) {
        currentTime.value = audioRef.value.currentTime;
        updateCurrentLyric();
    }
}

const onLoadedMetadata = () => {
    if (audioRef.value) {
        duration.value = audioRef.value.duration;
        global.music.audio = audioRef.value;
    }
}

const togglePlay = () => {
    audioRef.value?.paused ? audioRef.value?.play() : audioRef.value?.pause();
}

const upPause = () => {
    emit("pause");
    global.music.isPlaying = false;
}

const upPlay = () => {
    emit("play");
    global.music.isPlaying = true;
}

const previousSong = () => {
    if (global.music.data.length === 0) return;

    const currentIndex = global.music.data.findIndex(song => song.url === global.music.url) || 0;
    let previousIndex;

    switch (global.music.order) {
        case 'random':
            previousIndex = Math.floor(Math.random() * global.music.data.length);
            break;
        case 'single':
            audioRef.value && (audioRef.value.currentTime = 0, audioRef.value.play());
            return;
        case 'loop':
        default:
            previousIndex = currentIndex - 1;
            if (previousIndex < 0) {
                previousIndex = global.music.data.length - 1;
            }
            break;
    }

    loadSong(global.music.data[previousIndex]);
}

const nextSong = () => {
    if (global.music.data.length === 0) return;

    const currentIndex = global.music.data.findIndex(song => song.url === global.music.url) || 0;
    let nextIndex;

    switch (global.music.order) {
        case 'random':
            nextIndex = Math.floor(Math.random() * global.music.data.length);
            break;
        case 'single':
            audioRef.value && (audioRef.value.currentTime = 0, audioRef.value.play());
            return;
        case 'loop':
        default:
            nextIndex = currentIndex + 1;
            if (nextIndex >= global.music.data.length) {
                nextIndex = 0;
            }
            break;
    }

    loadSong(global.music.data[nextIndex]);
}

const loadSong = async (song: any, autoPlay = true) => {
    global.music.url = song.url;
    global.music.name = song.name;
    global.music.artist = song.artist;
    global.music.pic = song.pic;
    global.music.lrc = song.lrc;

    lyrics.value = await parseLrcUrl(song.lrc);
    currentTime.value = 0;
    global.music.curLrc = lyrics.value[0]?.content as string;

    updateMediaSessionMetadata();

    if (audioRef.value) {
        audioRef.value.load();
        autoPlay && setTimeout(() => audioRef.value?.play(), 200);
    }
}

const updateCurrentLyric = () => {
    if (lyrics.value.length === 0) return;

    const currentTimeMs = currentTime.value;
    let currentLyricIndex = 0;

    for (let i = 0; i < lyrics.value.length; i++) {
        if (lyrics.value[i]!.timestamp <= currentTimeMs) {
            currentLyricIndex = i;
        } else {
            break;
        }
    }

    global.music.curLrc = lyrics.value[currentLyricIndex]?.content as string;
}

const seekTo = (event: MouseEvent) => {
    if (!audioRef.value || duration.value === 0) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const seekTime = percent * duration.value;

    audioRef.value.currentTime = seekTime;
    currentTime.value = seekTime;
    audioRef.value.paused && audioRef.value.play();
}

const toggleOrder = () => {
    const orders = ['random', 'loop', 'single'];
    const currentIndex = orders.indexOf(global.music.order);
    const nextIndex = (currentIndex + 1) % orders.length;
    global.music.order = orders[nextIndex] as string;
}

const toggleVolume = () => {
    const volumes = [0.3, 0.6, 1];
    const currentIndex = volumes.indexOf(currentVolume.value);
    const nextIndex = (currentIndex + 1) % volumes.length;
    currentVolume.value = volumes[nextIndex] || 0.3;
    audioRef.value && (audioRef.value.volume = currentVolume.value);
}

const toggleCoverMode = () => {
    isStaticMode.value = !isStaticMode.value;
}

const updateMediaSessionMetadata = () => {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: global.music.name,
            artist: global.music.artist,
            album: '',
            artwork: [
                { src: global.music.pic }
            ]
        });
    }
}

const setupMediaSessionActions = () => {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            audioRef.value?.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioRef.value?.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            previousSong();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextSong();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime != null && audioRef.value) {
                audioRef.value.currentTime = details.seekTime;
                currentTime.value = details.seekTime;
            }
        });
    }
}

const loadThemeColor = () => {
    const color = getThemeColorFromImage(coverImg.value as HTMLImageElement);
    if (color) global.music.themeColor = color;
}

watch(() => global.music.url, (newUrl, oldUrl) => {
    if (newUrl && newUrl !== oldUrl) {
        const currentSong = global.music.data.find(song => song.url === newUrl);
        currentSong && loadSong(currentSong);
    }
});

watch(() => global.music.isPlaying, (isPlaying) => {
    if (isPlaying) {
        isStaticMode.value = false;
    } else {
        isStaticMode.value = true;
    }
});

onMounted(async () => {
    try {
        await global.loadMusic(env.music);
        coverImg.value?.addEventListener('load', loadThemeColor);

        if (global.music.data.length > 0 && !global.music.url) {
            const firstSong = global.music.order === 'random'
                ? global.music.data[Math.floor(Math.random() * global.music.data.length)]
                : global.music.data[0];
            loadSong(firstSong, false);
        } else {
            const song = global.music.data.find(song => song.url === global.music.url) || global.music.data[0];
            loadSong(song, false);
        }

        audioRef.value && (audioRef.value.volume = currentVolume.value);
        setupMediaSessionActions();
    } catch (error) {
        console.error('[music]', error);
    }
});

onUnmounted(() => {
    global.music.audio = null;
    global.music.isPlaying = false;
})
</script>

<style scoped>
.player {
    --theme: var(--theme-color);
    --theme-light: color-mix(in srgb, var(--theme) 20%, transparent);
    --theme-dark: color-mix(in srgb, var(--theme) 60%, transparent);
    --play-color: rgb(200, 80, 80);
    --vinyl-black: #1a1a1a;
    --vinyl-gray: #2a2a2a;

    width: 100%;
    max-width: 420px;
    display: flex;
    padding: 1.25rem;
    border-radius: 24px;
    flex-direction: column;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    background: color-mix(in srgb, var(--main-bg), var(--theme-dark) 68%);
    box-shadow: 0 8px 32px var(--theme-light);
    will-change: transform;
}

.top {
    gap: 1.75rem;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.cover-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 110px;
    height: 110px;
    flex-shrink: 0;
}

.vinyl-disc {
    position: absolute;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: radial-gradient(circle at center, var(--vinyl-gray) 0%, var(--vinyl-black) 35%, var(--vinyl-gray) 55%, var(--vinyl-black) 100%);
    box-shadow: 0 8px 24px var(--theme-light);
    z-index: 1;
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.vinyl-disc.rotating {
    animation: rotate 20s linear infinite;
    will-change: transform;
}

.vinyl-disc.hidden {
    opacity: 0;
    transform: scale(0.8);
}

.cover-container img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    z-index: 4;
    position: relative;
    box-shadow:
        0 0 0 4px var(--vinyl-gray),
        0 0 0 6px var(--vinyl-black),
        0 4px 12px var(--theme-light);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cover-container img.rotating {
    animation: rotate 20s linear infinite;
    will-change: transform;
}

.cover-container img.static-mode {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    box-shadow: 0 8px 24px var(--theme-light);
}

.cover-center {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--vinyl-black);
    z-index: 5;
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.cover-center.hidden {
    opacity: 0;
    transform: scale(0.5);
}

.cover-shadow {
    position: absolute;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: var(--theme);
    filter: blur(28px);
    opacity: 0.3;
    z-index: 0;
}

.info-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
    width: 100%;
}

.name-artist {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.name-artist>div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.name-artist .name {
    font-weight: bold;
    font-size: 1.15rem;
}

.name-artist .artist {
    font-size: 0.9rem;
    opacity: 0.7;
}

.cur-lyric {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 1.25rem;
    opacity: 0.85;
    width: 100%;
}

.progress-container {
    display: flex;
    gap: 0.5rem;
    font-size: 0.8rem;
    align-items: center;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: var(--theme-light);
    border-radius: 3px;
}

.progress {
    height: 100%;
    background: linear-gradient(90deg, var(--theme), color-mix(in srgb, var(--text-color), var(--theme) 68%));
    border-radius: 3px;
}

.cur-time,
.total-time {
    font-size: 0.75rem;
    min-width: 42px;
    text-align: center;
    color: var(--text-color);
    opacity: 0.8;
}

.bottom {
    display: flex;
    justify-content: center;
    margin-top: 1.25rem;
}

.controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 300px;
}

.control {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.control.play {
    width: 56px;
    height: 56px;
    background: var(--theme-light);
    border: 2px solid var(--theme);
}

.control.play .icon {
    width: 26px;
    height: 26px;
    color: var(--play-color);
}

@keyframes rotate {
    to {
        transform: rotate(360deg) translateZ(0);
    }
}

@media screen and (max-width: 768px) {
    .player {
        padding: 0.875rem;
        border-radius: 18px;
    }

    .top {
        gap: 0.5rem;
        flex-direction: column;
        padding-top: 0.5rem;
    }

    .cover-container {
        width: 120px;
        height: 120px;
        margin-top: -40px;
    }

    .vinyl-disc {
        width: 160px;
        height: 160px;
    }

    .cover-container img {
        width: 70px;
        height: 70px;
    }

    .cover-center {
        width: 16px;
        height: 16px;
    }

    .cover-shadow {
        width: 150px;
        height: 150px;
    }

    .info-container {
        width: 100%;
        align-items: center;
        text-align: center;
        gap: 0.625rem;
        margin-top: 1.5rem;
    }

    .name-artist {
        width: 100%;
    }

    .cur-lyric {
        width: 100%;
        max-width: 100%;
    }

    .progress-container {
        width: 100%;
    }

    .controls {
        max-width: 100%;
    }
}
</style>
