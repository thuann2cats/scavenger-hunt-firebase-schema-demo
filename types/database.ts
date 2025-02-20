export interface User {
  username: string;
  email: string;
  profilePictureUrl?: string;
  currentSession?: string;
  sessionsJoined: {
    [sessionId: string]: {
      teamId: string;
      points: number;
      foundArtifacts: { [artifactId: string]: boolean };
    }
  };
  isAdmin: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Session {
  sessionName: string;
  creatorId: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  teams: { [teamId: string]: boolean };
  participants: { [userId: string]: string }; // userId: teamId
  artifacts: { [artifactId: string]: boolean }; // Available artifacts in this session
}

export interface Team {
  sessionId: string;
  teamName: string;
  members: { [key: string]: boolean };
  // score removed as it's now tracked per-player only
}

export interface Artifact {
  name: string;
  description: string;
  locationHint: string;
  latitude: number;
  longitude: number;
  isChallenge: boolean;
}

export interface Verification {
  userId: string;
  artifactId: string;
  sessionId: string;
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
}

export interface DatabaseSchema {
  users: { [key: string]: User };
  sessions: { [key: string]: Session };
  teams: { [key: string]: Team };
  artifacts: { [key: string]: Artifact };
  verifications: { [key: string]: Verification };
}
