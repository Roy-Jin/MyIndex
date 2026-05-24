<template>
    <div ref="wrapperRef" class="scroll-wrapper">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import BScroll from '@better-scroll/core'
import type { Options } from '@better-scroll/core'
import MouseWheel from '@better-scroll/mouse-wheel';
import ObserveDOM from '@better-scroll/observe-dom';
import ObserveImage from '@better-scroll/observe-image';
import ScrollBar from '@better-scroll/scroll-bar';

// Props：允许外部传入配置
const props = withDefaults(
    defineProps<{
        options?: Options
    }>(),
    {
        options: () => ({})
    }
)

const wrapperRef = ref<HTMLDivElement | null>(null)
let bsInstance: BScroll | null = null

const defaultOptions: Options = {
    scrollY: true,       // 允许纵向滚动
    bounce: true,        // 回弹效果
    momentum: true,      // 惯性滚动
    observeDOM: true,    // 自动监听 DOM 变化
    observeImage: true,  // 自动监听图片加载
    click: true,         // 允许点击事件
    autoBlur: true,      // 自动失焦
    disableTouch: false, // 不禁止 touch 事件
    disableMouse: false, // 不禁止 mouse 事件
    mouseWheel: true,    // 允许滚轮事件
    scrollbar: undefined,     // 不显示滚动条
    ...props.options
}

onMounted(() => {
    if (wrapperRef.value) {
        BScroll.use(MouseWheel);
        BScroll.use(ObserveDOM);
        BScroll.use(ObserveImage);
        BScroll.use(ScrollBar);
        bsInstance = new BScroll(wrapperRef.value, defaultOptions)
    }
})

onUnmounted(() => {
    bsInstance?.destroy()
    bsInstance = null
})

watch(
    () => props.options,
    (newOpts) => {
        if (bsInstance) {
            bsInstance.refresh()
        }
    },
    { deep: true }
)

// 暴露方法给父组件
defineExpose({
    refresh() {
        bsInstance?.refresh()
    },
    scrollTo(x: number, y: number, time = 300) {
        bsInstance?.scrollTo(x, y, time)
    },
    getBScrollInstance(): BScroll | null {
        return bsInstance
    }
})
</script>

<style scoped>
.scroll-wrapper {
    width: 100%;
    height: 100%;
    flex: 1;
    overflow: hidden;
    position: relative;
}
</style>