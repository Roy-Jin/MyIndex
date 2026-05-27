<template>
    <div v-if="isOpen" class="menu-overlay" @click.self="closeMenu">
    </div>
    <div class="menu" :class="{ 'open': isOpen }" :style="{
        top: `${top}px`,
        height: `calc(100% - ${top}px)`
    }">
        <Scrollable class="content-wrapper">
            <div class="content">
                <div class="title">
                    <span>{{ t('menu.title') }}</span>
                </div>
                <MusicPlayer class="cursor-target" />
                <hr>
                <div class="switcher-container">
                    <Switcher class="cursor-target" :icon="themeIcon" :label="$t('theme.name')" :value="themeValue"
                        @click="toggleTheme" />
                    <Switcher class="cursor-target" :icon="Languages" :label="$t('lang.name')"
                        :value="$t(`lang.${global.lang}`)" @click="toggleLang" />
                </div>
                <hr>
                <div class="footer">{{ useEnv().copyright }}</div>
            </div>
        </Scrollable>
    </div>
</template>

<script setup lang='ts'>
import { useEnv } from '@/stores/env';
import { useGlobal } from '@/stores/global';
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Languages } from '@lucide/vue';
import { Scrollable } from '@/components/Libs';
import { Switcher, MusicPlayer } from '@/components/Menu';
import { pushEscHandler, popEscHandler } from '@/utils';

const props = defineProps<{
    top: number
}>();

const isOpen = ref(false);
const global = useGlobal();
const { t } = useI18n();

const themeIcon = computed(() => {
    return global.theme === 'light' ? Sun : Moon;
});

const themeValue = computed(() => {
    return global.theme === 'light' ? t('theme.light') : t('theme.dark');
});

const toggleTheme = (event: MouseEvent) => {
    global.toggleTheme({ clientX: event.clientX, clientY: event.clientY });
};

const toggleLang = (event: MouseEvent) => {
    global.toggleLang(undefined, { clientX: event.clientX, clientY: event.clientY });
};

const closeMenu = () => {
    isOpen.value = false;
};

watch(() => isOpen.value, (val) => {
    if (val) {
        pushEscHandler(closeMenu);
    } else {
        popEscHandler();
    }
});

onUnmounted(() => {
    popEscHandler();
});

defineExpose({
    toggle: () => {
        isOpen.value = !isOpen.value;
    },
    isOpen: isOpen,
})
</script>

<style scoped>
.menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 76;
    background: transparent;
}

.menu {
    width: 100%;
    max-width: 768px;
    overflow: hidden;
    position: fixed;
    backdrop-filter: var(--filter-blur);
    right: 0;
    transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
    transform: translateX(100%) translateZ(0);
    opacity: 0;
    pointer-events: none;
    z-index: 77;
    display: flex;
    flex-direction: column;
    justify-content: safe center;
    align-items: center;
    background: var(--theme-color-light);
    will-change: transform, opacity;
}

.menu.open {
    pointer-events: all;
    transform: translateX(0) translateZ(0);
    opacity: 1;
}

.content {
    gap: 1.5rem;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 1rem;

    .title {
        font-family: "仓耳逍遥行书";
        margin: 2rem 0 1.5rem 0;
        font-weight: 900;
        font-size: 2.5rem;
        text-shadow: 0 0 10px var(--main-bg);
        opacity: 0.86;
        animation: fadeInUp 0.5s ease;

        * {
            margin: 0 .5rem;
        }
    }

    hr {
        width: 90%;
        height: 2px;
        border: none;
        background: linear-gradient(to right, transparent, var(--theme-color), transparent);
    }

    .switcher-container {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .footer {
        font-size: small;
        margin: 2rem 0 1rem 0;
        color: var(--text-color);
        opacity: 0.7;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px) translateZ(0);
    }

    to {
        opacity: 0.86;
        transform: translateY(0) translateZ(0);
    }
}

@media screen and (max-width: 768px) {
    .content {
        padding: 0.75rem;
        gap: 1.25rem;

        .title {
            font-size: 2rem;
            margin: 1.5rem 0 1rem 0;
        }
    }
}
</style>