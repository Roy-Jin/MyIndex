<template>
    <div class="projects">
        <Repo v-if="filteredRepos[0]" :repo="filteredRepos[0]" style="backdrop-filter: var(--filter-blur);"/>
        <button class="show-more-btn cursor-target" @click="repoAllRef?.showPopup">
            <FolderGit2 />
            {{ t('projects.showMore') }}
        </button>
    </div>
    <RepoAll ref="repoAllRef" :repos="filteredRepos" />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';
import { useGlobal } from '@/stores/global';
import { useEnv } from '@/stores/env';
import { filterRepos } from '@/utils';
import { Repo, RepoAll } from '@/components/Projects';
import { useI18n } from 'vue-i18n';
import { FolderGit2 } from '@lucide/vue';

const { t } = useI18n();
const global = useGlobal();
const env = useEnv();

const repoAllRef = ref<typeof RepoAll | null>(null);

const filteredRepos = computed(() => {
    return filterRepos(global.gh_repos, env.gh_repos.excludePatterns);
});
</script>

<style scoped>
.projects {
    gap: .5rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.show-more-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 2px solid var(--theme-color);
    border-radius: var(--border-radius);
    background-color: var(--theme-color-light);
    backdrop-filter: var(--filter-blur);
}
</style>
