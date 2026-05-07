export const qk = {
  protocols: () => ["protocols"] as const,
  protocol: (slug: string) => ["protocols", slug] as const,
  userProtocols: () => ["me", "protocols"] as const,
  sessions: (cursor?: string) => ["me", "sessions", cursor ?? null] as const,
  session: (id: string) => ["sessions", id] as const,
  checkins: (sessionId?: string) => ["me", "checkins", sessionId ?? null] as const,
  achievements: () => ["me", "achievements"] as const,
  citations: () => ["citations"] as const,
};
