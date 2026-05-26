<script setup lang="ts">
import { gsap } from 'gsap';
import { onMounted, onBeforeUnmount, ref, useTemplateRef, watch, nextTick } from 'vue';

interface TargetCursorProps {
    targetSelector?: string[];
    titleSelector?: string;
    spinDuration?: number;
    hideDefaultCursor?: boolean;
}

const showCursor = ref(false);

const props = withDefaults(defineProps<TargetCursorProps>(), {
    targetSelector: () => ['.cursor-target', 'button', '.control'],
    titleSelector: 'target-title',
    spinDuration: 2,
    hideDefaultCursor: true
});

const cursorRef = useTemplateRef('cursorRef');
const titleRef = useTemplateRef('titleRef');
const cornersRef = ref<NodeListOf<HTMLDivElement> | null>(null);
const spinTl = ref<gsap.core.Timeline | null>(null);
const currentTitle = ref('');
const showTitle = ref(false);

const constants = {
    borderWidth: 3,
    cornerSize: 12,
    parallaxStrength: 0.00005
};

const moveCursor = (x: number, y: number) => {
    showCursor.value = true;
    if (!cursorRef.value) return;

    gsap.to(cursorRef.value, {
        x,
        y,
        duration: 0.1,
        ease: 'power3.out'
    });
};

const titleGap = 8;
const titleScreenPadding = 12;

const calcTitlePosition = (targetRect: DOMRect, cursorX?: number, cursorY?: number) => {
    if (!titleRef.value) return { left: 0, top: 0 };

    const titleWidth = titleRef.value.offsetWidth;
    const titleHeight = titleRef.value.offsetHeight;

    if (!titleWidth || !titleHeight) return { left: 0, top: 0 };

    let left = targetRect.right;
    let top = targetRect.top - titleGap - titleHeight;

    if (top < titleScreenPadding) {
        top = targetRect.bottom + titleGap;
    }
    if (left + titleWidth > window.innerWidth - titleScreenPadding) {
        left = targetRect.left - titleWidth;
    }

    if (cursorX !== undefined && cursorY !== undefined) {
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const parallaxStrength = 0.35;
        left += (cursorX - targetCenterX) * parallaxStrength;
        top += (cursorY - targetCenterY) * parallaxStrength;
    }

    return { left, top };
};

const showTargetTitle = (text: string, targetRect: DOMRect, cursorX?: number, cursorY?: number) => {
    currentTitle.value = text;
    showTitle.value = true;

    nextTick(() => {
        if (!titleRef.value) return;
        gsap.killTweensOf(titleRef.value);

        const pos = calcTitlePosition(targetRect, cursorX, cursorY);

        gsap.set(titleRef.value, {
            x: pos.left,
            y: pos.top,
            opacity: 0,
            scale: 0.8
        });
        gsap.to(titleRef.value, {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'back.out(1.7)'
        });
    });
};

const hideTargetTitle = () => {
    if (!titleRef.value || !showTitle.value) return;
    gsap.killTweensOf(titleRef.value);
    gsap.to(titleRef.value, {
        opacity: 0,
        scale: 0.8,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
            showTitle.value = false;
            currentTitle.value = '';
        }
    });
};

let cleanupAnimation: () => void = () => { };

const setupAnimation = () => {
    if (!cursorRef.value) return;

    const originalCursor = document.body.style.cursor;
    if (props.hideDefaultCursor) {
        document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.value;
    cornersRef.value = cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner');

    let activeTarget: Element | null = null;
    let currentTargetMove: ((ev: Event) => void) | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let isAnimatingToTarget = false;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;
    let titleObserver: MutationObserver | null = null;

    const cleanupObserver = () => {
        if (titleObserver) {
            titleObserver.disconnect();
            titleObserver = null;
        }
    };

    const cleanupTarget = (target: Element) => {
        if (currentTargetMove) {
            target.removeEventListener('mousemove', currentTargetMove);
        }
        if (currentLeaveHandler) {
            target.removeEventListener('mouseleave', currentLeaveHandler);
        }
        currentTargetMove = null;
        currentLeaveHandler = null;
        cleanupObserver();
    };

    const resetTargetState = () => {
        if (!activeTarget) return;

        const prevTarget = activeTarget;
        activeTarget = null;
        isAnimatingToTarget = false;

        cleanupTarget(prevTarget);
        cleanupObserver();
        hideTargetTitle();

        if (cornersRef.value) {
            const corners = Array.from(cornersRef.value);
            gsap.killTweensOf(corners);

            const { cornerSize } = constants;
            const positions = [
                { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
            ];

            const tl = gsap.timeline();
            corners.forEach((corner, index) => {
                tl.to(
                    corner as HTMLElement,
                    {
                        x: positions[index]!.x,
                        y: positions[index]!.y,
                        duration: 0.3,
                        ease: 'power3.out'
                    },
                    0
                );
            });
        }

        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
        }

        resumeTimeout = setTimeout(() => {
            if (!activeTarget && cursorRef.value && spinTl.value) {
                const currentRotation = gsap.getProperty(cursorRef.value, 'rotation') as number;
                const normalizedRotation = currentRotation % 360;

                spinTl.value.kill();
                spinTl.value = gsap
                    .timeline({ repeat: -1 })
                    .to(cursorRef.value, { rotation: '+=360', duration: props.spinDuration, ease: 'none' });

                gsap.to(cursorRef.value, {
                    rotation: normalizedRotation + 360,
                    duration: props.spinDuration * (1 - normalizedRotation / 360),
                    ease: 'none',
                    onComplete: () => {
                        spinTl.value?.restart();
                    }
                });
            }
            resumeTimeout = null;
        }, 50);
    };

    gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        opacity: 1,
        display: 'block'
    });

    const createSpinTimeline = () => {
        if (spinTl.value) {
            spinTl.value.kill();
        }
        spinTl.value = gsap
            .timeline({ repeat: -1 })
            .to(cursor, { rotation: '+=360', duration: props.spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    const moveHandler = (e: MouseEvent) => {
        moveCursor(e.clientX, e.clientY);
        if (titleRef.value && showTitle.value && activeTarget && activeTarget.hasAttribute(props.titleSelector)) {
            const targetRect = activeTarget.getBoundingClientRect();
            const pos = calcTitlePosition(targetRect, e.clientX, e.clientY);
            gsap.to(titleRef.value, {
                x: pos.left,
                y: pos.top,
                duration: 0.1,
                ease: 'power3.out'
            });
        }
    };
    window.addEventListener('mousemove', moveHandler);

    const enterHandler = (e: MouseEvent) => {
        const directTarget = e.target as Element;

        if (activeTarget && directTarget !== activeTarget && !activeTarget.contains(directTarget)) {
            resetTargetState();
        }

        const allTargets: Element[] = [];
        let current = directTarget;
        const targets = props.targetSelector;
        while (current && current !== document.body) {
            for (let i = 0; i < targets.length; i++) {
                const selector = targets[i];
                if (selector && current.matches(selector)) {
                    allTargets.push(current);
                }
            }
            current = current.parentElement!;
        }

        const target = allTargets[0] || null;
        if (!target || !cursorRef.value || !cornersRef.value) return;

        if (activeTarget === target) return;

        if (activeTarget) {
            cleanupTarget(activeTarget);
        }

        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }

        activeTarget = target;
        const titleAttr = target.getAttribute(props.titleSelector);
        if (titleAttr) {
            const targetRect = target.getBoundingClientRect();
            showTargetTitle(titleAttr, targetRect, e.clientX, e.clientY);
        } else {
            hideTargetTitle();
        }

        cleanupObserver();
        titleObserver = new MutationObserver(() => {
            if (!cursorRef.value || activeTarget !== target) return;
            const newTitle = target.getAttribute(props.titleSelector);
            if (newTitle) {
                const targetRect = target.getBoundingClientRect();
                const cursorRect = cursorRef.value!.getBoundingClientRect();
                const cursorX = cursorRect.left + cursorRect.width / 2;
                const cursorY = cursorRect.top + cursorRect.height / 2;
                showTargetTitle(newTitle, targetRect, cursorX, cursorY);
            } else {
                hideTargetTitle();
            }
        });
        titleObserver.observe(target, {
            attributes: true,
            attributeFilter: [props.titleSelector]
        });

        const corners = Array.from(cornersRef.value);
        corners.forEach(corner => {
            gsap.killTweensOf(corner);
        });
        gsap.killTweensOf(cursorRef.value, 'rotation');
        spinTl.value?.pause();

        gsap.set(cursorRef.value, { rotation: 0 });

        const updateCorners = (mouseX?: number, mouseY?: number) => {
            const rect = target.getBoundingClientRect();
            const cursorRect = cursorRef.value!.getBoundingClientRect();

            const cursorCenterX = cursorRect.left + cursorRect.width / 2;
            const cursorCenterY = cursorRect.top + cursorRect.height / 2;

            const [tlc, trc, brc, blc] = Array.from(cornersRef.value!);

            const { borderWidth, cornerSize, parallaxStrength } = constants;

            const tlOffset = {
                x: rect.left - cursorCenterX - borderWidth,
                y: rect.top - cursorCenterY - borderWidth
            };
            const trOffset = {
                x: rect.right - cursorCenterX + borderWidth - cornerSize,
                y: rect.top - cursorCenterY - borderWidth
            };
            const brOffset = {
                x: rect.right - cursorCenterX + borderWidth - cornerSize,
                y: rect.bottom - cursorCenterY + borderWidth - cornerSize
            };
            const blOffset = {
                x: rect.left - cursorCenterX - borderWidth,
                y: rect.bottom - cursorCenterY + borderWidth - cornerSize
            };

            if (mouseX !== undefined && mouseY !== undefined) {
                const targetCenterX = rect.left + rect.width / 2;
                const targetCenterY = rect.top + rect.height / 2;
                const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
                const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;

                tlOffset.x += mouseOffsetX;
                tlOffset.y += mouseOffsetY;
                trOffset.x += mouseOffsetX;
                trOffset.y += mouseOffsetY;
                brOffset.x += mouseOffsetX;
                brOffset.y += mouseOffsetY;
                blOffset.x += mouseOffsetX;
                blOffset.y += mouseOffsetY;
            }

            const tl = gsap.timeline();
            const cornerElements = [tlc, trc, brc, blc];
            const offsets = [tlOffset, trOffset, brOffset, blOffset];

            cornerElements.forEach((corner, index) => {
                tl.to(
                    corner as HTMLElement,
                    {
                        x: offsets[index]!.x,
                        y: offsets[index]!.y,
                        duration: 0.2,
                        ease: 'power2.out'
                    },
                    0
                );
            });
        };

        isAnimatingToTarget = true;
        updateCorners();

        setTimeout(() => {
            isAnimatingToTarget = false;
        }, 1);

        let moveThrottle: number | null = null;
        const targetMove = (ev: Event) => {
            if (moveThrottle || isAnimatingToTarget) return;
            moveThrottle = requestAnimationFrame(() => {
                const mouseEvent = ev as MouseEvent;
                updateCorners(mouseEvent.clientX, mouseEvent.clientY);
                moveThrottle = null;
            });
        };

        const leaveHandler = () => {
            resetTargetState();
        };

        currentTargetMove = targetMove;
        currentLeaveHandler = leaveHandler;

        target.addEventListener('mousemove', targetMove);
        target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    const blurHandler = () => resetTargetState();
    window.addEventListener('blur', blurHandler);

    cleanupAnimation = () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseover', enterHandler);
        window.removeEventListener('blur', blurHandler);

        if (activeTarget) {
            cleanupTarget(activeTarget);
        }

        cleanupObserver();

        if (resumeTimeout) {
            clearTimeout(resumeTimeout);
            resumeTimeout = null;
        }

        spinTl.value?.kill();
        spinTl.value = null;

        if (cursorRef.value) {
            gsap.killTweensOf(cursorRef.value);
        }
        if (cornersRef.value) {
            gsap.killTweensOf(Array.from(cornersRef.value));
        }
        if (titleRef.value) {
            gsap.killTweensOf(titleRef.value);
        }

        showTitle.value = false;
        currentTitle.value = '';

        if (cursorRef.value) {
            gsap.set(cursorRef.value, {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 0,
                display: 'none'
            });
        }

        document.body.style.cursor = originalCursor;
        activeTarget = null;
    };
};

onMounted(() => {
    if (/phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|Windows Phone/i.test(navigator.userAgent)) return;
    setupAnimation();
});

onBeforeUnmount(() => {
    cleanupAnimation();
});

watch(
    () => [props.targetSelector, props.spinDuration, props.hideDefaultCursor],
    () => {
        cleanupAnimation();
        if (/phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|Windows Phone/i.test(navigator.userAgent)) return;
        setupAnimation();
    }
);

watch(
    () => props.spinDuration,
    () => {
        if (!cursorRef.value || !spinTl.value) return;

        if (spinTl.value.isActive()) {
            spinTl.value.kill();
            spinTl.value = gsap
                .timeline({ repeat: -1 })
                .to(cursorRef.value, { rotation: '+=360', duration: props.spinDuration, ease: 'none' });
        }
    },
    { immediate: true }
);
</script>

<template>
    <div ref="cursorRef" v-show="showCursor"
        class="top-0 left-0 z-[9999] fixed w-0 h-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference transform opacity-0"
        :style="{ willChange: 'transform' }">
        <!-- <div class="top-1/2 left-1/2 absolute bg-white rounded-full w-1 h-1 -translate-x-1/2 -translate-y-1/2 transform"
            :style="{ willChange: 'transform' }" /> -->
        <div class="top-1/2 left-1/2 absolute border-[3px] border-white border-r-0 border-b-0 w-3 h-3 -translate-x-[150%] -translate-y-[150%] target-cursor-corner transform"
            :style="{ willChange: 'transform' }" />
        <div class="top-1/2 left-1/2 absolute border-[3px] border-white border-b-0 border-l-0 w-3 h-3 -translate-y-[150%] translate-x-1/2 target-cursor-corner transform"
            :style="{ willChange: 'transform' }" />
        <div class="top-1/2 left-1/2 absolute border-[3px] border-white border-t-0 border-l-0 w-3 h-3 translate-x-1/2 translate-y-1/2 target-cursor-corner transform"
            :style="{ willChange: 'transform' }" />
        <div class="top-1/2 left-1/2 absolute border-[3px] border-white border-t-0 border-r-0 w-3 h-3 -translate-x-[150%] translate-y-1/2 target-cursor-corner transform"
            :style="{ willChange: 'transform' }" />
    </div>
    <div ref="titleRef" v-show="showTitle"
        class="top-0 left-0 z-[9999] fixed pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-xl opacity-0 transform"
        :style="{ willChange: 'transform', background: 'var(--text-color)', color: 'var(--main-bg)' }">
        {{ currentTitle }}
    </div>
</template>