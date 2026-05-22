import { defineStore } from "pinia";
import { setI18nLanguage } from "@/i18n";
import { useEnv } from "@/stores/env";
import {
  createCircleViewTransition,
  formatString,
  getSystemTheme,
  setDocumentTheme,
  translateTexts,
} from "@/utils";

export const useGlobal = defineStore("global", {
  state: () => ({
    lang: "zh" as string,
    theme: getSystemTheme() as "light" | "dark",
    sayings: {
      text: "" as string,
      from: "" as string,
      text_en: null as string | null,
      from_en: null as string | null,
    },
    gh_repos: [] as {
      name: string;
      html_url: string;
      description: string | null;
      description_zh: string | null;
      stargazers_count?: number;
      forks_count?: number;
      watchers_count?: number;
      language?: string | null;
      pushed_at?: string;
      updated_at?: string;
      color?: string;
      [key: string]: unknown;
    }[],
    music: {
      data: [] as {
        url: string;
        name: string;
        artist: string;
        pic: string;
        lrc: string;
      }[],
      artist: "" as string,
      lrc: "" as string,
      name: "" as string,
      pic: "" as string,
      url: "" as string,
      curLrc: "" as string,
      themeColor: "" as string,
      order: "random" as string,
      audio: null as HTMLAudioElement | null,
      isPlaying: false as boolean,
    },
    updated_at: {
      music: 0 as number,
      sayings: 0 as number,
      gh_repos: 0 as number,
    },
  }),

  getters: {
    getCurrentLanguage: (state) => state.lang,
    getCurrentTheme: (state) => state.theme,
  },

  actions: {
    toggleTheme(event?: { clientX: number; clientY: number }) {
      const newTheme = this.theme === "light" ? "dark" : "light";

      const toggleThemeAction = () => {
        this.theme = newTheme;
        setDocumentTheme(newTheme);
      };

      if (event) {
        createCircleViewTransition(event, toggleThemeAction);
      } else {
        toggleThemeAction();
      }
    },

    toggleLang(lang?: string, event?: { clientX: number; clientY: number }) {
      const newLang = lang ? lang : this.lang === "zh" ? "en" : "zh";

      const toggleLangAction = () => {
        this.lang = newLang;
        setI18nLanguage(this.lang);
      };

      if (event) {
        createCircleViewTransition(event, toggleLangAction);
      } else {
        toggleLangAction();
      }
    },

    initLang() {
      setI18nLanguage(this.lang);
    },

    async loadSayings(
      config: {
        apis: {
          url: string;
          enable: boolean;
          name: string;
          format: (response: any) => Promise<{ text: string; from: string }>;
        }[];
        upd_freq: number;
      },
    ): Promise<void> {
      if (this.updated_at.sayings + config.upd_freq > Date.now()) return;
      let enabledAPIs = config.apis.filter((api) => api.enable);
      if (enabledAPIs.length === 0) {
        return console.warn("[sayings] No available APIs.");
      }
      while (enabledAPIs.length > 0) {
        const randomAPI =
          enabledAPIs[Math.floor(Math.random() * enabledAPIs.length)];
        if (!randomAPI) return;

        const response = await fetch(randomAPI.url).catch((e) => {
          return { ok: false, error: e };
        });
        if (response.ok) {
          const formated = await randomAPI.format(response);
          this.sayings = {
            text: formated.text,
            from: formated.from,
            text_en: null,
            from_en: null,
          };
          break;
        } else {
          enabledAPIs = enabledAPIs.filter((api) =>
            api.name !== randomAPI.name
          );
        }
      }
      this.updated_at.sayings = Date.now();

      const env = useEnv();
      const textsToTranslate = [this.sayings.text];
      const shouldTranslateFrom = this.sayings.from &&
        !this.sayings.from.startsWith("sayings.");
      if (shouldTranslateFrom) {
        textsToTranslate.push(this.sayings.from);
      }

      translateTexts(
        textsToTranslate,
        "en",
        env.translate.api,
      ).then((translated) => {
        this.sayings.text_en = translated[0] || this.sayings.text;
        if (shouldTranslateFrom && translated.length > 1) {
          this.sayings.from_en = translated[1] || this.sayings.from;
        }
      });
    },

    async loadGhRepos(config: {
      user: string;
      api: string;
      upd_freq: number;
    }): Promise<void> {
      if (this.updated_at.gh_repos + config.upd_freq > Date.now()) return;
      const url = formatString(config.api, config.user);
      const data = await fetch(url).then((response) => response.json());

      this.gh_repos = data.map((repo: any) => ({
        ...repo,
        description_zh: null,
      }));

      this.updated_at.gh_repos = Date.now();

      const env = useEnv();

      translateTexts(
        data.map((repo: any) => repo.description || ""),
        "zh",
        env.translate.api,
      ).then((translatedDescriptions) => {
        this.gh_repos = this.gh_repos.map((repo, index) => ({
          ...repo,
          description_zh: translatedDescriptions[index] || repo.description,
        }));
      });
    },

    async loadMusic(config: {
      apis: string[];
      server: string;
      type: string;
      id: string;
      upd_freq: number;
    }): Promise<void> {
      if (this.updated_at.music + config.upd_freq > Date.now()) return;
      const apis = config.apis;
      for (let i = 0; i < apis.length; i++) {
        const api = apis[i] as string;
        try {
          const api_url = new URL(api);
          api_url.searchParams.set("server", config.server);
          api_url.searchParams.set("type", config.type);
          api_url.searchParams.set("id", config.id);
          const response = await fetch(api_url.href);
          if (!response.ok) continue;
          const data = await response.json() as any[];
          this.music.data = data.reverse().map((song: any) => {
            return {
              url: song.url,
              name: song.name || song.title,
              artist: song.artist || song.author,
              pic: song.pic,
              lrc: song.lrc,
            };
          });
          break;
        } catch (e) {
          continue;
        }
      }
      this.updated_at.music = Date.now();
    },
  },

  persist: {
    key: "myindex-global",
    storage: localStorage,
  },
});
