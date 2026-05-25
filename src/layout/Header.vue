<template>
    <div class="header" ref="headerRef" v-if="isShow">
        <div class="left">
            <img :src="envInfo.logo" alt="logo">
            <h2>{{ envInfo.title[0] }}<span class="subtitle">{{ envInfo.title[1] }}</span></h2>
        </div>
        <div class="right">
            <div class="musicInfo" v-if="global.music.isPlaying">
                <div :style="{ color: `color-mix(in srgb, ${global.music.themeColor}, var(--text-color) 60%)` }">
                    {{ global.music.name }}
                </div>
                <div>{{ global.music.curLrc }}</div>
            </div>
            <div class="menu-btn">
                <component v-if="global.music.audio" :is="Disc3Icon" @click="tooglePlayPause" :size="24"
                    :class="{ 'play': global.music.isPlaying, 'pause': !global.music.isPlaying }" class="cursor-target"
                    :color="global.music.themeColor" :target-title="t('music.title') + ': ' + global.music.name" />
                <component :is="menuRef?.isOpen ? XIcon : MenuIcon" strokeWidth="3px" @click="toggleMenu" :size="32"
                    color="var(--theme-color)" class="cursor-target" :target-title="t('menu.title')" />
            </div>
        </div>
    </div>
    <Menu ref="menuRef" :top="height" />
</template>

<script setup lang='ts'>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useEnv } from '@/stores/env';
import { useGlobal } from '@/stores/global';
import { MenuIcon, XIcon, Disc3Icon } from '@lucide/vue';
import { useI18n } from 'vue-i18n';
import Menu from '@/layout/Menu.vue';

const env = useEnv();
const global = useGlobal();
const headerRef = ref<HTMLDivElement | null>(null);
const menuRef = ref<any | null>(null);
const height = ref(0);
const isShow = ref(true);
let resizeObserver: ResizeObserver | null = null;
const { t } = useI18n();

const toggleMenu = () => {
    menuRef.value?.toggle()
}
const tooglePlayPause = () => {
    if (global.music.audio) {
        if (!global.music.isPlaying) {
            global.music.audio.play();
        } else {
            global.music.audio.pause();
        }
    }
}

const updateHeight = () => {
    if (headerRef.value) {
        height.value = headerRef.value.offsetHeight
    }
}

const envInfo = computed(() => {
    const title = env.title;
    return {
        logo: env.avatar[1],
        title: [title[0] + '|', title[1]]
    };
})

onUnmounted(() => {
    resizeObserver?.disconnect()
})

onMounted(async () => {
    await nextTick()
    updateHeight()

    if (headerRef.value) {
        resizeObserver = new ResizeObserver(() => {
            updateHeight()
        })
        resizeObserver.observe(headerRef.value)
    }
    global.music.isPlaying = false;
})

defineExpose({
    height,
    show: () => {
        isShow.value = true;
    },
    hide: () => {
        isShow.value = false;
    }
})
</script>

<style scoped>
.header {
    width: 100%;
    position: fixed;
    display: flex;
    padding: 0.5rem 6%;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: var(--filter-blur);
    background: var(--theme-color-light);
    z-index: 88;
}

.left {
    width: 100%;
    display: flex;
    align-items: end;
    font-size: x-large;
    flex-direction: row;
    white-space: nowrap;
    font-family: "Playball";
}

.left>img {
    width: 4rem;
    height: 4rem;
    margin-right: 0.5rem;
}

.subtitle {
    font-size: 60%;
    opacity: 0.6;
}

.right {
    flex: 1;
    display: flex;
    flex-direction: row;
}

.musicInfo {
    max-width: 10rem;
    overflow: hidden;
    margin-right: 0.5rem;
    font-size: small;

    &>div {
        font-weight: bolder;
        text-align: end;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    &>div:last-child {
        font-weight: 100;
        font-size: .5rem;
        opacity: .6;
    }

}

.menu-btn {
    gap: 1rem;
    height: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .play {
        filter: brightness(1.2) saturate(200%);
        animation: spin 3s linear infinite;
    }

    .pause {
        filter: brightness(1.2) opacity(0.5);
    }
}

@media screen and (max-width: 768px) {
    .left {
        font-size: unset;

        img {
            width: 2rem;
            height: 2rem;
            margin-right: 0.5rem;
        }
    }

    .menu-btn {
        gap: 0.5rem;
    }
}

@media screen and (max-width: 480px) {
    .musicInfo {
        display: none;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
