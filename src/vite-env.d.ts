/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 仅开发模式生效：为 true 时 API 层使用 src/apis/fixtures.ts 模拟数据。默认关闭（直连真实后端）。 */
  readonly VITE_PORTAL_USE_FIXTURES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
