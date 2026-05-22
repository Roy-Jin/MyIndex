<template>
    <div v-bind="$attrs" @click="handleClick" class="project cursor-target" :class="{ 'active': isAnimating }"
        :style="{ background: `color-mix(in srgb, ${repo.color ?? ''} 20%, transparent)` }">
        <div class="project-content">
            <div class="project-header">
                <span class="project-name" :style="{ display: 'flex', alignItems: 'center', gap: '0.5rem' }">
                    <BookMarked :style="{ color: 'var(--theme-color)' }" />
                    {{ repo.name }}
                </span>
            </div>
            <div v-if="displayDescription" class="project-description">
                <TextEllipsis> {{ displayDescription }}</TextEllipsis>
            </div>
            <div v-if="repo.homepage" class="project-homepage">
                <LinkIcon :size="14" />
                <span class="homepage-text" @click.stop="handleHomepageClick">{{ repo.homepage }}</span>
            </div>
            <div class="project-footer">
                <div class="project-stats">
                    <span v-if="repo.language" class="stat-item">
                        <Code :size="14" />
                        {{ repo.language }}
                    </span>
                    <span v-if="repo.stargazers_count !== undefined" class="stat-item">
                        <Star :size="14" />
                        {{ repo.stargazers_count }}
                    </span>
                    <span v-if="repo.forks_count !== undefined" class="stat-item">
                        <GitFork :size="14" />
                        {{ repo.forks_count }}
                    </span>
                    <span v-if="repo.watchers_count !== undefined" class="stat-item">
                        <Eye :size="14" />
                        {{ repo.watchers_count }}
                    </span>
                </div>
                <div v-if="repo.pushed_at" class="project-updated">
                    <Clock :size="14" />
                    <span>{{ formatDate(repo.pushed_at, t) }}</span>
                </div>
            </div>
        </div>
    </div>
    <VConfirmDialog v-model:show="dialogShow" :title="dialogTitle" :message="dialogMessage" close-on-click-overlay
        @confirm="onDialogConfirm" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Star, Code, GitFork, Eye, Clock, BookMarked, LinkIcon } from '@lucide/vue';
import VConfirmDialog from '@/components/VConfirmDialog.vue';
import TextEllipsis from '@/components/TextEllipsis.vue';
import type { RepoProps } from '@/components/Projects';
import { formatDate } from '@/utils';

const { t, locale } = useI18n();

const props = defineProps<{
    repo: RepoProps;
}>();

const displayDescription = computed(() => {
    if (locale.value === 'zh' && props.repo.description_zh) {
        return props.repo.description_zh;
    }
    return props.repo.description;
});

const isAnimating = ref(false);
const dialogShow = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');
const pendingUrl = ref('');

const openDialog = (url: string) => {
    pendingUrl.value = url;
    dialogTitle.value = t('tips.openLink.title');
    dialogMessage.value = `${t('tips.openLink.message')}\n\n${url}`;
    dialogShow.value = true;
};

const onDialogConfirm = () => {
    window.open(pendingUrl.value, '_blank');
};

const handleClick = () => {
    isAnimating.value = true;
    setTimeout(() => {
        isAnimating.value = false;
    }, 400);
    if (props.repo.html_url) {
        openDialog(props.repo.html_url);
    }
};

const handleHomepageClick = () => {
    if (props.repo.homepage) {
        openDialog(props.repo.homepage);
    }
};
</script>

<style scoped>
.project {
    width: 100%;
    height: 100%;
    padding: 1rem;
    display: flex;
    border-radius: 10px;
    text-decoration: none;
    color: var(--text-color);
    font-family: "Electrolize", sans-serif;
    border-left: 4px solid var(--theme-color);
    background-color: var(--theme-color-light);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-color) 10%, transparent), transparent);
        transition: left 0.6s ease;
    }

    &:hover {
        border-color: var(--theme-color);
        box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-color) 20%, transparent);

        &::before {
            left: 100%;
        }

        .project-name {
            transform: translateX(4px);
        }
    }

    &:active {
        transform: scale(0.98);
    }

    &.active {
        .project-content {
            animation: pulse 0.4s ease;
        }
    }
}

.project-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: space-between;
    position: relative;
    z-index: 1;
}

.project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.project-name {
    font-size: 1.5rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: transform 0.3s ease;
}

.project-description {
    font-size: 0.9rem;
}

.project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.project-stats {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.85rem;
    opacity: 0.75;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

@media (max-width: 480px) {

    .stat-item:nth-child(3),
    .stat-item:nth-child(4) {
        display: none;
    }
}

.project-updated {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    opacity: 0.65;
}

.project-homepage {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--theme-color);
    overflow: hidden;
}

.homepage-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;

    &:hover {
        text-decoration: underline;
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }
}
</style>
