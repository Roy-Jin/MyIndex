<template>
    <LineClamp as="span" v-model:expanded="expanded" :text="computedText" :max-lines="maxLines">
        <template v-if="expandActive" #after="{ clamped, expanded, toggle }">
            <span v-if="clamped && !expanded" @click="(event) => {
                event.stopPropagation();
                toggle();
            }" class="text-ellipsis">
                [{{ t('tips.expand') }}]
            </span>
            <span v-else-if="expanded && !clamped" @click="(event) => {
                event.stopPropagation();
                toggle();
            }" class="text-ellipsis">
                [{{ t('tips.collapse') }}]
            </span>
        </template>
    </LineClamp>
</template>

<script setup lang='ts'>
import { computed, ref, useSlots } from 'vue';
import { LineClamp } from "vue-clamp";
import { useI18n } from 'vue-i18n';

const slots = useSlots();
const expanded = ref(false);
const { t } = useI18n();
const props = defineProps({
    text: {
        type: String,
        default: ''
    },
    maxLines: {
        type: Number,
        default: 2
    },
    expandActive: {
        type: Boolean,
        default: false
    }
});

const computedText = computed(() => {
    if (slots.default) {
        const slotContent = slots.default();
        if (slotContent.length > 0) {
            return slotContent.map(node => {
                if (typeof node.children === 'string') {
                    return node.children;
                }
                return '';
            }).join('');
        }
    }
    return props.text;
});
</script>

<style scoped>
.text-ellipsis {
    font-weight: normal;
    color: var(--theme-color);
}
</style>