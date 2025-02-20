import { BaseService } from './BaseService';
import { User, Team } from '../types/database';

export class UserService extends BaseService {
  async createUser(userId: string): Promise<void> {
    const exists = await this.exists(`users/${userId}`);
    if (exists) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      username: '',
      email: '',
      sessionsJoined: {},
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.setData(`users/${userId}`, newUser);
  }

  async getUser(userId: string): Promise<User | null> {
    return await this.getData<User>(`users/${userId}`);
  }

  async setUsername(userId: string, username: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/username`, username);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async setEmail(userId: string, email: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/email`, email);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async setProfilePicture(userId: string, url: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/profilePictureUrl`, url);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async setCurrentSession(userId: string, sessionId: string | null): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (sessionId && (!user.sessionsJoined || !user.sessionsJoined[sessionId])) {
      throw new Error('User is not part of this session');
    }

    await this.setData(`users/${userId}/currentSession`, sessionId);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    await this.setData(`users/${userId}/isAdmin`, isAdmin);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async addUserToSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const sessionExists = await this.exists(`sessions/${sessionId}`);
    if (!sessionExists) throw new Error('Session does not exist');
    
    // More defensive check - treat undefined sessionsJoined same as empty object
    if (user.sessionsJoined && user.sessionsJoined[sessionId]) {
      throw new Error('User is already part of this session');
    }

    await this.setData(`users/${userId}/sessionsJoined/${sessionId}`, {
      points: 0,
      foundArtifacts: {}
    });
    await this.setData(`sessions/${sessionId}/participants/${userId}`, '');
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async removeUserFromSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error('User is not part of this session');
    }

    const sessionData = user.sessionsJoined[sessionId];
    if (sessionData && sessionData.teamId) {
      throw new Error('Remove user from team first before removing from session');
    }

    await this.removeData(`users/${userId}/sessionsJoined/${sessionId}`);
    await this.removeData(`sessions/${sessionId}/participants/${userId}`);
    
    if (user.currentSession === sessionId) {
      await this.setData(`users/${userId}/currentSession`, null);
    }
    
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async assignUserToTeam(userId: string, sessionId: string, teamId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error('User is not part of this session');
    }

    const teamExists = await this.exists(`teams/${teamId}`);
    if (!teamExists) throw new Error('Team does not exist');

    const team = await this.getData<Team>(`teams/${teamId}`);
    if (!team) throw new Error('Team not found');

    if (team.sessionId !== sessionId) {
      throw new Error('Team does not belong to this session');
    }

    // If user is already in another team in this session, remove them first
    const currentTeamId = user.sessionsJoined[sessionId].teamId;
    if (currentTeamId) {
      await this.removeData(`teams/${currentTeamId}/members/${userId}`);
    }

    await this.setData(`users/${userId}/sessionsJoined/${sessionId}/teamId`, teamId);
    await this.setData(`teams/${teamId}/members/${userId}`, true);
    await this.setData(`sessions/${sessionId}/participants/${userId}`, teamId);
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async removeUserFromTeam(userId: string, sessionId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const sessionData = user.sessionsJoined?.[sessionId];
    if (!sessionData) throw new Error('User is not part of this session');

    const teamId = sessionData.teamId;
    if (!teamId) throw new Error('User is not part of any team in this session');

    await this.removeData(`teams/${teamId}/members/${userId}`);
    await this.setData(`users/${userId}/sessionsJoined/${sessionId}/teamId`, null);
    await this.setData(`sessions/${sessionId}/participants/${userId}`, '');
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async addFoundArtifact(userId: string, sessionId: string, artifactId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error('User is not part of this session');
    }

    const sessionExists = await this.exists(`sessions/${sessionId}/artifacts/${artifactId}`);
    if (!sessionExists) {
      throw new Error('Artifact is not part of this session');
    }

    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`, 
      true
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async removeFoundArtifact(userId: string, sessionId: string, artifactId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const sessionData = user.sessionsJoined?.[sessionId];
    if (!sessionData) throw new Error('User is not part of this session');

    if (!sessionData.foundArtifacts || !sessionData.foundArtifacts[artifactId]) {
      throw new Error('Artifact is not in user\'s found artifacts');
    }

    await this.removeData(
      `users/${userId}/sessionsJoined/${sessionId}/foundArtifacts/${artifactId}`
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async updatePoints(userId: string, sessionId: string, points: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.sessionsJoined || !user.sessionsJoined[sessionId]) {
      throw new Error('User is not part of this session');
    }

    await this.setData(
      `users/${userId}/sessionsJoined/${sessionId}/points`,
      points
    );
    await this.setData(`users/${userId}/updatedAt`, Date.now());
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    // More defensive check for sessionsJoined
    if (user.sessionsJoined && Object.keys(user.sessionsJoined).length > 0) {
      throw new Error('User still has session associations. Remove from all sessions first');
    }

    await this.removeData(`users/${userId}`);
  }

  async listUserSessions(userId: string): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    return Object.keys(user.sessionsJoined || {});
  }
}
