import type { OrderBrief } from "../../src/lib/custom-order";
declare global {
  interface Window {
    submittedBriefs: OrderBrief[];
    failSubmission: boolean;
  }
}
window.submittedBriefs = [];
window.failSubmission = false;
export const useServerFn = <T>(fn: T) => fn;
export async function submitCustomOrder({ data }: { data: OrderBrief }) {
  window.submittedBriefs.push(data);
  return window.failSubmission ? { ok: false, error: "Test failure" } : { ok: true };
}
export const supabase = {
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.com/${path}` } }),
    }),
  },
};
