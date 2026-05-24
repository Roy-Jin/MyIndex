<template>
    <div class="today-section">
        <div id="date">
            <p class="time">
                <span class="num">
                    <Counter :font-size="50" :font-weight="600" :value="time.hours"
                        :mediaScreen="[{ maxWidth: 768, props: { fontSize: 40 } }]" />
                    <span>:</span>
                    <Counter :font-size="50" :font-weight="600" :value="time.minutes"
                        :mediaScreen="[{ maxWidth: 768, props: { fontSize: 40 } }]" />
                    <span>:</span>
                    <Counter :font-size="50" :font-weight="600" :value="time.seconds"
                        :mediaScreen="[{ maxWidth: 768, props: { fontSize: 40 } }]" />
                </span>
            </p>
            <p class="day">{{ time.day }}</p>
        </div>
        <hr>
        <div id="sayings">
            <p class="text">
                <TextEllipsis :maxLines="3" expand-active>{{ displayText }}</TextEllipsis>
            </p>
            <p class="from">——《{{ displayFrom }}》</p>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import { Counter } from '@/components/Today';
import { useI18n } from 'vue-i18n';
import { useGlobal } from '@/stores/global';
import { TextEllipsis } from '@/components/Libs';

const { t, locale } = useI18n();
const global = useGlobal();

const displayText = computed(() => {
    if (locale.value === 'en' && global.sayings.text_en) {
        return global.sayings.text_en;
    }
    return global.sayings.text;
});

const displayFrom = computed(() => {
    if (locale.value === 'en' && global.sayings.from_en) {
        return global.sayings.from_en;
    }
    return t(global.sayings.from);
});

const time = ref({
    hours: 0,
    minutes: 0,
    seconds: 0,
    period: 'AM',
    day: 'Monday, 1 January.'
});

let updateInterval: any;

const updateTime = () => {
    const now = dayjs();
    time.value = {
        hours: Number(now.format('HH')),
        minutes: Number(now.format('mm')),
        seconds: Number(now.format('ss')),
        period: now.format('A'),
        day: now.format('dddd, D MMMM.')
    };
};

onMounted(() => {
    updateTime();
    updateInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
</script>

<style scoped>
.today-section {
    width: 100%;
    padding: 1rem;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    background: radial-gradient(ellipse at 33% 25%, var(--theme-color), transparent)
}

#date {
    font-family: "Playball";
}

.time>.num {
    width: 100%;
    font-family: sans-serif;

    &>span {
        font-size: 3rem;
        font-weight: 600;
        display: inline-block;
        padding-right: 0.3rem;
        transform: translateY(-.5rem);
    }
}

.time>.sub {
    font-size: 15px;
}

#date>.day {
    font-size: 18px;
    font-weight: 500;
}

.today-section>hr {
    width: 100%;
    height: 1px;
    border: none;
    margin: 1rem auto;
    background: linear-gradient(to right, var(--theme-color), transparent 64%);
}

#sayings>.text {
    font-weight: bold;
}

#sayings>.from {
    white-space: nowrap;
    opacity: 0.648;
    float: right;
    font-size: 64.8%;
}

@media screen and (max-width: 768px) {
    .time>.num>span {
        font-size: 2rem;
        transform: translateY(-.4rem);
    }
}
</style>
