import { randomUUID } from "node:crypto";
import type { BattleSession } from "./types";

const sessions = new Map<string, BattleSession>();

export function createSession(
  data: Omit<BattleSession, "id" | "createdAt" | "updatedAt">
): BattleSession {
  const now = new Date().toISOString();
  const session: BattleSession = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): BattleSession | undefined {
  return sessions.get(sessionId);
}

export function updateSession(
  sessionId: string,
  patch: Partial<BattleSession>
): BattleSession | undefined {
  const existing = sessions.get(sessionId);
  if (!existing) return undefined;

  const updated: BattleSession = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  sessions.set(sessionId, updated);
  return updated;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function clearAllSessions(): void {
  sessions.clear();
}
