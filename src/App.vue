<template>
    <Header ref="headerRef" />
    <div class="views" :style="{ paddingTop: headerHeight + 'px' }">
        <router-view />
    </div>
    <TargetCursor :spin-duration="1.5" />
</template>

<script setup lang="ts">
import { ref, provide, onMounted, computed } from 'vue'
import { useGlobal } from './stores/global'
import { setDocumentTheme } from '@/utils'
import { TargetCursor } from '@/components/Libs';
import Header from '@/layout/Header.vue'

const headerRef = ref<InstanceType<typeof Header> | null>(null)
const global = useGlobal()

const headerHeight = computed(() => {
    return headerRef.value?.height || 0
})

provide('header', {
    show: () => headerRef.value?.show(),
    hide: () => headerRef.value?.hide()
})

onMounted(() => {
    document.oncontextmenu = () => false;
    document.addEventListener('keydown', (e) => e.key === 'F12' && !import.meta.env.DEV && e.preventDefault());
    setDocumentTheme(global.theme);
    useGlobal().initLang();
})

</script>

<style>
@import '@styles/base.css';
@import "tailwindcss";

#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.views {
    flex: 1;
    width: 100%;
    height: 100%;
}
</style>
