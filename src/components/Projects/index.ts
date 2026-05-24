export { default as Repo } from "./Repo.vue";
export { default as RepoAll } from "./RepoAll.vue";

export interface RepoProps {
    name: string;
    html_url: string;
    homepage?: string | null;
    description: string | null;
    description_zh?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    watchers_count?: number;
    language?: string | null;
    pushed_at?: string;
    color?: string;
}
