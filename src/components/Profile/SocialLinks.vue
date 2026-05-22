<template>
    <div class="social-links">
        <div v-for="link in socialLinks" :key="link.name" @click="handleClick(link.href)"
            :style="{ '--link-color': link.color }" class="link cursor-target">
            <Icon :icon="link.icon" :fill="link.color" />
        </div>
    </div>
    <VConfirmDialog v-model:show="dialogShow" :title="dialogTitle" :message="dialogMessage" close-on-click-overlay
        confirm-button-color="var(--theme-color)"
        :cancel-button-color="'color-mix(in srgb, grey 60%, transparent)'" @confirm="onDialogConfirm" />
</template>

<script setup lang='ts'>
import { defineAsyncComponent, computed, ref } from 'vue';
import { useEnv } from '@/stores/env';
const Icon = defineAsyncComponent(() => import('../Icon.vue'));
import { useI18n } from 'vue-i18n';
import VConfirmDialog from '@/components/VConfirmDialog.vue';

const { t } = useI18n();
const env = useEnv();

const dialogShow = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');
const pendingUrl = ref('');

const socialLinks = computed(() => {
    return env.social.map(link => {
        if (!link.color || !link.icon || !link.href || !link.name) {
            console.warn(`Invalid social link: ${JSON.stringify(link)}. Missing required properties.`);
            return null;
        }
        return link;
    }).filter(link => link !== null);
});

const handleClick = (url: string) => {
    pendingUrl.value = url;
    dialogTitle.value = t('tips.openLink.title');
    dialogMessage.value = `${t('tips.openLink.message')}\n\n${url}`;
    dialogShow.value = true;
};

const onDialogConfirm = () => {
    window.open(pendingUrl.value, '_blank');
};
</script>

<style scoped>
.social-links {
    gap: 1rem;
    padding: .5rem;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
}

.link {
    height: 48px;
    width: 48px;
    padding: 8px;
    display: flex;
    border-radius: 10px;
    align-items: center;
    text-decoration: none;
    justify-content: center;
    background-color: color-mix(in srgb, var(--link-color) 20%, transparent);
    color: color-mix(in srgb, var(--theme-color) 85%, transparent);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    border: 2px solid transparent;

    &:hover {
        background-color: color-mix(in srgb, var(--link-color) 30%, transparent);
        border-color: color-mix(in srgb, var(--link-color) 40%, transparent);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--link-color) 20%, transparent);
    }

    &:active {
        transform: scale(0.95);
    }
}
</style>
