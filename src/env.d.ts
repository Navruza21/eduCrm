interface ImportMetaEnv {
  /** Backend API base URL, e.g. `https://edu.thesofmebel.uz/crm/api/v1`. Default: `/api/v1`. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
