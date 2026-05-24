export const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const setDocumentTheme = (theme: "light" | "dark"): void => {
  document.documentElement.setAttribute("data-theme", theme);
};
