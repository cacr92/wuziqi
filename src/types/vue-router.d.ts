declare module 'vue-router' {
  import { RouteRecordRaw, Router } from '@vue/router'
  export * from '@vue/router'
  export function useRouter(): Router
  export function createRouter(options: {
    history: any
    routes: RouteRecordRaw[]
  }): Router
} 