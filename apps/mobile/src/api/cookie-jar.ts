import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "wellcore.cookies.v1";

type CookieRecord = { name: string; value: string; expiresAt?: number };

function parseSetCookie(line: string): CookieRecord | null {
  const [pair, ...attrs] = line.split(";").map((s) => s.trim());
  if (!pair) return null;
  const eq = pair.indexOf("=");
  if (eq < 0) return null;
  const name = pair.slice(0, eq).trim();
  const value = pair.slice(eq + 1).trim();
  let expiresAt: number | undefined;
  for (const a of attrs) {
    const [k, v] = a.split("=").map((s) => s.trim());
    if (!k) continue;
    if (k.toLowerCase() === "max-age" && v) {
      const seconds = parseInt(v, 10);
      if (Number.isFinite(seconds)) expiresAt = Date.now() + seconds * 1000;
    } else if (k.toLowerCase() === "expires" && v) {
      const t = Date.parse(v);
      if (Number.isFinite(t)) expiresAt = t;
    }
  }
  return { name, value, expiresAt };
}

async function read(): Promise<Map<string, CookieRecord>> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return new Map();
  try {
    const arr = JSON.parse(raw) as CookieRecord[];
    return new Map(arr.map((c) => [c.name, c]));
  } catch {
    return new Map();
  }
}

async function write(map: Map<string, CookieRecord>) {
  const now = Date.now();
  const live = [...map.values()].filter((c) => !c.expiresAt || c.expiresAt > now);
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(live));
}

export function createCookieJar() {
  return {
    async attachCookies(headers: Headers): Promise<Headers> {
      const map = await read();
      const live = [...map.values()].filter((c) => !c.expiresAt || c.expiresAt > Date.now());
      if (!live.length) return headers;
      const cookieHeader = live.map((c) => `${c.name}=${c.value}`).join("; ");
      headers.set("cookie", cookieHeader);
      return headers;
    },
    async captureSetCookies(lines: string[]): Promise<void> {
      const map = await read();
      for (const line of lines) {
        const c = parseSetCookie(line);
        if (!c) continue;
        if (c.expiresAt && c.expiresAt <= Date.now()) {
          map.delete(c.name);
        } else {
          map.set(c.name, c);
        }
      }
      await write(map);
    },
    async setRawSetCookieHeader(raw: string): Promise<void> {
      const lines = raw.split(/,(?=\s*[A-Za-z0-9!#$%&'*+\-.^_`|~]+=)/);
      await this.captureSetCookies(lines);
    },
    async clear(): Promise<void> {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    },
  };
}

export type CookieJar = ReturnType<typeof createCookieJar>;
