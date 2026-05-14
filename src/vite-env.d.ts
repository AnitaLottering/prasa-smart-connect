/// <reference types="vite/client" />

declare interface Window {
  google: typeof google;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
