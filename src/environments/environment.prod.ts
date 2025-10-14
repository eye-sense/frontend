const runtimeConfig = (typeof window !== 'undefined' && (window as any).__env) || {};

export const environment = {
  production: true,
  apiUrl: runtimeConfig.apiUrl || 'http://localhost:8090'
};
