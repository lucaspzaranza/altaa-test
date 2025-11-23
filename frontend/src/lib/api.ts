export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function api(path: string) {
  return `${API_URL}${path}`;
}