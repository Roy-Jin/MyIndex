import { getColorSync } from "colorthief";

export const getThemeColorFromImage = (
  img: HTMLImageElement,
): string | null => {
  try {
    const color = getColorSync(img);
    return color ? color.hex() : null;
  } catch {
    return null;
  }
};

export const setCSSVariable = (
  name: string,
  value: string,
  element?: HTMLElement,
): void => {
  const target = element || document.documentElement;
  target.style.setProperty(name, value);
};

export const getCSSColor = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};