<template>
    <Scrollable ref="scrollRef" :style="{ overflow: 'unset' }">
        <div class="wrapper">
            <Profile />
            <div class="content">
                <Today />
                <Projects />
            </div>
        </div>
    </Scrollable>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import { useEnv } from '@/stores/env';
import { useGlobal } from '@/stores/global';
import {
    Profile,
    Today,
    Projects
} from '@/layout';
import { Scrollable } from '@/components/Libs';

const env = useEnv();
const global = useGlobal();
const scrollRef = ref<any>(null);

onMounted(async () => {
    await global.loadSayings(env.sayings);
    await global.loadGhRepos(env.gh_repos);
    scrollRef.value?.refresh();
    scrollRef.value?.scrollTo(0, 0);
    document.getElementById('loading')?.setAttribute('data-hidden', 'TRUE');
});
</script>

<style scoped>
.wrapper {
    gap: 2rem;
    width: 100%;
    height: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
}

.content {
    gap: 1rem;
    display: flex;
    max-width: 500px;
    align-items: center;
    flex-direction: column;
    justify-content: center;
}

@media screen and (max-width: 768px) {
    .wrapper {
        flex-direction: column;
        height: unset;
    }

    .content {
        width: 80%;
        margin-bottom: 1rem;
    }
}
</style>
