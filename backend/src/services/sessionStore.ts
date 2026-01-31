import { v4 as uuidv4 } from 'uuid';

export type SessionMode = 'conversation' | 'campaign';

export interface Session {
  id: string;
  mode: SessionMode;
  messages: { role: 'user' | 'assistant'; content: string }[];
  extractedIntake?: any;
  confirmedIntake?: any;
  stageOutputs: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

class SessionStore {
  private store = new Map<string, Session>();
  private ttlMs = 1000 * 60 * 60; // 1 hour

  getOrCreate(id?: string): Session {
    if (id) {
      const s = this.store.get(id);
      if (s && Date.now() - s.updatedAt < this.ttlMs) return s;
    }

    const session: Session = {
      id: uuidv4(),
      mode: 'conversation',
      messages: [],
      stageOutputs: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.store.set(session.id, session);
    return session;
  }

  save(session: Session) {
    session.updatedAt = Date.now();
    this.store.set(session.id, session);
  }
}

export default new SessionStore();
