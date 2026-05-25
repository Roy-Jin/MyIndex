<template>
    <div class="social-links">
        <div v-for="link in socialLinks" :key="link.name" @click="handleClick(link.href)"
            :style="{ '--link-color': link.color }" class="link cursor-target" :target-title="link.name">
            <Icon :icon="link.icon" :fill="link.color" />
        </div>
    </div>
    <ConfirmDialog v-model:show="dialogShow" @confirm="onDialogConfirm" close-on-click-overlay
        @update:show="isQrShow = false">
        <template #title>{{ dialogTitle }}</template>
        {{ t('tips.openLink.message') }}
        <div v-if="isQrShow">
            <QR :value="pendingUrl" @dblclick="isQrShow = false" :target-title="t('tips.qr.dbcHide')" />
            <div class="w-full h-6 flex items-center justify-center" @click="isQrShow = false">
                <XIcon class="cursor-target" strokeWidth="5px" :target-title="t('tips.qr.hide')" />
            </div>
        </div>
        <div v-else class="flex items-center justify-center gap-2 mt-5">
            <TextEllipsis :max-lines="1" :text="pendingUrl" />
            <div class="w-6 h-6 cursor-target" :target-title="t('tips.qr.show')">
                <QrCodeIcon @click="isQrShow = true" />
            </div>
        </div>
    </ConfirmDialog>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';
import { useEnv } from '@/stores/env';
import { Icon, ConfirmDialog, QR, TextEllipsis } from '@/components/Libs';
import { useI18n } from 'vue-i18n';
import { QrCodeIcon, XIcon } from '@lucide/vue';

const { t } = useI18n();
const env = useEnv();

const dialogShow = ref(false);
const dialogTitle = ref('');
const isQrShow = ref(false);
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
