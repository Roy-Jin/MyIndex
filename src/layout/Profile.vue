<template>
    <div class="profile-section">
        <div class="base">
            <Avatar />
            <h4 class="name">{{ env.name }}</h4>
            <div class="subtitle">{{ t('subtitle') }}</div>
        </div>
        <Quote :quote="t('quote')" />
        <SocialLinks />
    </div>
</template>

<script setup lang='ts'>
import { Avatar, Quote, SocialLinks } from '@/components/Profile';
import { useEnv } from '@/stores/env';
import { useI18n } from 'vue-i18n';

const env = useEnv();
const { t } = useI18n();
</script>

<style scoped>
.profile-section {
    gap: 1rem;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.base {
    z-index: 2;
    padding: 1rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: var(--border-radius);
    background: radial-gradient(ellipse at 50% 80%, var(--theme-color), transparent);
    backdrop-filter: var(--filter-blur);
}

.name {
    font-size: 2rem;
    text-align: center;
    font-weight: normal;
    font-family: "Playball";
}

.subtitle {
    font-family: "Playball", "仓耳逍遥行书";
}
</style>
