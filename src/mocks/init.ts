// conditional msw initialization based on feature flag
export async function initMocks() {
  if (import.meta.env.VITE_MSW_ENABLED !== 'true') return;
  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
