<template>
    <div class="quote">
        <Icon icon="quoteLeft" fill="var(--theme-color)" width="1.5rem" />
        <p class="quote-text">{{ quote }}</p>
    </div>
</template>

<script setup lang='ts'>
import { Icon } from '@/components/Libs';

const props = defineProps<{
    quote: string;
}>();
</script>

<style scoped>
.quote {
    width: 95%;
    padding: .5rem;
    display: flex;
    max-width: 500px;
    border-radius: 10px;
    flex-direction: row;
    font-family: "仓耳逍遥行书", "Playball";
    background: linear-gradient(to right bottom, var(--theme-color-light), transparent);
    backdrop-filter: var(--filter-blur);
}

.quote-text {
    flex: 1;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
}
</style>
