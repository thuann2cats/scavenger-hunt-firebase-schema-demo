import { BaseService } from './BaseService';
import { Artifact, Session } from '../types/database';

export class ArtifactService extends BaseService {
  async createArtifact(artifactId: string): Promise<void> {
    const exists = await this.exists(`artifacts/${artifactId}`);
    if (exists) {
      throw new Error('Artifact already exists');
    }

    const newArtifact: Artifact = {
      name: '',
      description: '',
      locationHint: '',
      latitude: 0,
      longitude: 0,
      isChallenge: false
    };

    await this.setData(`artifacts/${artifactId}`, newArtifact);
  }

  async getArtifact(artifactId: string): Promise<Artifact | null> {
    return await this.getData<Artifact>(`artifacts/${artifactId}`);
  }

  async setName(artifactId: string, name: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/name`, name);
  }

  async setDescription(artifactId: string, description: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/description`, description);
  }

  async setLocationHint(artifactId: string, hint: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/locationHint`, hint);
  }

  async setCoordinates(artifactId: string, latitude: number, longitude: number): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/latitude`, latitude);
    await this.setData(`artifacts/${artifactId}/longitude`, longitude);
  }

  async setImageUrl(artifactId: string, imageUrl: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/imageUrl`, imageUrl);
  }

  async setAudioUrl(artifactId: string, audioUrl: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/audioUrl`, audioUrl);
  }

  async setChallengeStatus(artifactId: string, isChallenge: boolean): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.setData(`artifacts/${artifactId}/isChallenge`, isChallenge);
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');

    // Check if artifact is used in any session
    const sessions = await this.getData<{ [key: string]: Session }>('sessions');
    if (sessions) {
      for (const sessionId of Object.keys(sessions)) {
        if (sessions[sessionId].artifacts[artifactId]) {
          throw new Error('Cannot delete artifact that is part of an active session');
        }
      }
    }

    await this.removeData(`artifacts/${artifactId}`);
  }

  async listSessionArtifacts(sessionId: string): Promise<string[]> {
    const session = await this.getData<Session>(`sessions/${sessionId}`);
    if (!session) throw new Error('Session not found');

    return Object.keys(session.artifacts);
  }

  async getArtifactLocation(artifactId: string): Promise<{ latitude: number; longitude: number }> {
    const artifact = await this.getArtifact(artifactId);
    if (!artifact) throw new Error('Artifact not found');

    return {
      latitude: artifact.latitude,
      longitude: artifact.longitude
    };
  }
}
