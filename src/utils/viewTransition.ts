interface ViewTransitionOptions {
  duration?: number;
  easing?: string;
  enableGrayscale?: boolean;
}

export const isGeckoOrWebKit = (): boolean => {
  const ua = navigator.userAgent;
  return /firefox/i.test(ua) ||
    (/applewebkit/i.test(ua) && !/chrome/i.test(ua));
};

export const createCircleViewTransition = async (
  event: { clientX: number; clientY: number },
  updateCallback: () => void,
  options: ViewTransitionOptions = {},
) => {
  const {
    duration = 500,
    easing = "cubic-bezier(0.2, 0, 0.6, 0.4)",
    enableGrayscale = true,
  } = options;

  if (!document.startViewTransition) {
    updateCallback();
    return;
  }

  const { clientX: x, clientY: y } = event;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(updateCallback);

  await transition.ready;

  const animations: Animation[] = [];

  if (enableGrayscale) {
    animations.push(
      document.documentElement.animate(
        {
          filter: ["grayscale(0%)", "grayscale(100%)"],
        },
        {
          duration,
          easing,
          pseudoElement: "::view-transition-old(root)",
        },
      ),
    );
  }

  animations.push(
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing,
        pseudoElement: "::view-transition-new(root)",
      },
    ),
  );

  await Promise.all(animations.map((anim) => anim.finished));
};
