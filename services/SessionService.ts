import { BaseService } from './BaseService';
import { Session, Team } from '../types/database';

export class SessionService extends BaseService {
  async createSession(sessionId: string, creatorId: string): Promise<void> {
    const exists = await this.exists(`sessions/${sessionId}`);
    if (exists) {
      throw new Error('Session already exists');
    }

    const newSession: Session = {
      sessionName: '',
      creatorId,
      startTime: 0,
      endTime: 0,
      isActive: false,
      teams: {},
      participants: {},
      artifacts: {}
    };

    await this.setData(`sessions/${sessionId}`, newSession);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return await this.getData<Session>(`sessions/${sessionId}`);
  }

  async setSessionName(sessionId: string, name: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await this.setData(`sessions/${sessionId}/sessionName`, name);
  }

  async setTimes(sessionId: string, startTime: number, endTime: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    await this.setData(`sessions/${sessionId}/startTime`, startTime);
    await this.setData(`sessions/${sessionId}/endTime`, endTime);
  }

  async setActiveStatus(sessionId: string, isActive: boolean): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await this.setData(`sessions/${sessionId}/isActive`, isActive);
  }

  async addTeam(sessionId: string, teamId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const team = await this.getData<Team>(`teams/${teamId}`);
    if (!team) throw new Error('Team not found');

    if (team.sessionId) {
      throw new Error('Team is already part of another session');
    }

    // More defensive check - treat undefined/null members same as empty object
    if (team.members && Object.keys(team.members).length > 0) {
      throw new Error('Team must be empty before adding to session');
    }

    await this.setData(`sessions/${sessionId}/teams/${teamId}`, true);
    await this.setData(`teams/${teamId}/sessionId`, sessionId);
  }

  async removeTeam(sessionId: string, teamId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.teams || !session.teams[teamId]) {
      throw new Error('Team is not part of this session');
    }

    const team = await this.getData<Team>(`teams/${teamId}`);
    if (!team) throw new Error('Team not found');

    // More defensive check for team.members
    if (team.members && Object.keys(team.members).length > 0) {
      throw new Error('Team must be empty before removing from session');
    }

    await this.removeData(`sessions/${sessionId}/teams/${teamId}`);
    await this.removeData(`teams/${teamId}/sessionId`);
  }

  async addArtifact(sessionId: string, artifactId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const artifactExists = await this.exists(`artifacts/${artifactId}`);
    if (!artifactExists) throw new Error('Artifact not found');

    await this.setData(`sessions/${sessionId}/artifacts/${artifactId}`, true);
  }

  async removeArtifact(sessionId: string, artifactId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.artifacts || !session.artifacts[artifactId]) {
      throw new Error('Artifact is not part of this session');
    }

    // More defensive check - treat undefined/null participants same as empty object
    if (session.participants) {
      for (const userId of Object.keys(session.participants)) {
        const userData = await this.getData(
          `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`
        );
        if (userData) {
          throw new Error('Cannot remove artifact that has been found by users');
        }
      }
    }

    await this.removeData(`sessions/${sessionId}/artifacts/${artifactId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    // More defensive checks for participants and teams
    if (session.participants && Object.keys(session.participants).length > 0) {
      throw new Error('Cannot delete session with active participants');
    }

    if (session.teams && Object.keys(session.teams).length > 0) {
      throw new Error('Cannot delete session with associated teams');
    }

    await this.removeData(`sessions/${sessionId}`);
  }

  async listSessionTeams(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.teams || {});
  }

  async listSessionParticipants(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.participants || {});
  }

  async listSessionArtifacts(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.artifacts || {});
  }
}
