import { BaseService } from './BaseService';
import { Team } from '../types/database';

export class TeamService extends BaseService {
  async createTeam(teamId: string): Promise<void> {
    const exists = await this.exists(`teams/${teamId}`);
    if (exists) {
      throw new Error('Team already exists');
    }

    const newTeam: Team = {
      sessionId: '',
      teamName: '',
      members: {}
    };

    await this.setData(`teams/${teamId}`, newTeam);
  }

  async getTeam(teamId: string): Promise<Team | null> {
    return await this.getData<Team>(`teams/${teamId}`);
  }

  async setTeamName(teamId: string, name: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    await this.setData(`teams/${teamId}/teamName`, name);
  }

  async addMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    if (!team.sessionId) {
      throw new Error('Team must be assigned to a session before adding members');
    }

    // Check if user exists in the team's session
    const userInSession = await this.exists(
      `sessions/${team.sessionId}/participants/${userId}`
    );
    if (!userInSession) {
      throw new Error('User must be part of the session before joining team');
    }

    // More defensive check - make sure members exists
    if (team.members && team.members[userId]) {
      throw new Error('User is already a member of this team');
    }

    await this.setData(`teams/${teamId}/members/${userId}`, true);
    await this.setData(
      `sessions/${team.sessionId}/participants/${userId}`,
      teamId
    );
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // More defensive check for members property
    if (!team.members || !team.members[userId]) {
      throw new Error('User is not a member of this team');
    }

    await this.removeData(`teams/${teamId}/members/${userId}`);
    if (team.sessionId) {
      await this.setData(
        `sessions/${team.sessionId}/participants/${userId}`,
        ''
      );
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    if (team.sessionId) {
      throw new Error('Remove team from session before deletion');
    }

    // More defensive check for members property
    if (team.members && Object.keys(team.members).length > 0) {
      throw new Error('Remove all team members before deletion');
    }

    await this.removeData(`teams/${teamId}`);
  }

  async listTeamMembers(teamId: string): Promise<string[]> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // More defensive check when listing members
    return Object.keys(team.members || {});
  }

  async getTeamSession(teamId: string): Promise<string | null> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    return team.sessionId || null;
  }
}
