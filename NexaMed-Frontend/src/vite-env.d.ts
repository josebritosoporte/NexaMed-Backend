/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // más variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
