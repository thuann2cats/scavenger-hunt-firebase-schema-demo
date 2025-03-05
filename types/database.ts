/**
 * Georgia Tech Scavenger Hunt Database Schema
 * 
 * This file defines the core data structures and relationships for the scavenger hunt app.
 * It enforces strict rules for object creation, association, and deletion to maintain data integrity.
 * 
 * Key Relationships:
 * - Users <-> Sessions: Many-to-many. Users can join multiple sessions
 * - Teams <-> Sessions: One-to-one. Teams belong to exactly one session and cannot be reused
 * - Users <-> Teams: Contextual. Users can join one team per session
 * 
 * Creation Rules:
 * - All objects must be created as blank objects first
 * - Attributes must be set via separate update operations
 * - Empty objects must be properly initialized with required empty collections
 * 
 * Association Rules:
 * 1. Session-Team Association:
 *    - Teams must be empty when added to a session
 *    - Teams can only belong to one session at a time
 * 
 * 2. User-Session Association:
 *    - Users must join a session before joining any team in that session
 *    - Users can track found artifacts and points per session
 * 
 * 3. User-Team Association:
 *    - Users can only join teams within sessions they've joined
 *    - Users can only be in one team per session
 *    - Users can be in different teams across different sessions
 * 
 * Deletion Rules:
 * 1. Remove associations in correct order:
 *    a. Remove user-team associations
 *    b. Remove team-session associations
 *    c. Remove user-session associations
 *    d. Delete the empty object
 * 
 * 2. Specific Restrictions:
 *    - Users: Cannot be deleted while in any session
 *    - Teams: Cannot be deleted while in a session or with members
 *    - Sessions: Cannot be deleted with teams or participants
 * 
 * Error Messages:
 * The system provides specific error messages for common violation scenarios:
 * - Invalid creation attempts
 * - Invalid association attempts
 * - Premature deletion attempts
 * - Missing or invalid references
 * 
 * Example Deletion Process:
 * To delete a user:
 * 1. For each session:
 *    - Remove user from team (if in one)
 *    - Remove user from session
 * 2. Verify user has no remaining associations
 * 3. Delete user object
 * 
 * @packageDocumentation
 */

/**
 * User object representing a player in the scavenger hunt
 * 
 * Creation Requirements:
 * - Must be created blank with empty sessionsJoined
 * - Attributes set via separate operations
 * 
 * Key Properties:
 * @property displayName - User's display name
 * @property email - User's email address
 * @property currentSession - ID of active session (must exist in sessionsJoined)
 * @property sessionsJoined - Tracks all session participation and associated data
 * @property isAdmin - Administrative privileges flag
 * 
 * Timestamps:
 * @property createdAt - Auto-populated creation timestamp
 * @property updatedAt - Auto-updated modification timestamp
 */
export interface User {
  displayName: string;  // Changed from username
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

/**
 * Session object representing an active scavenger hunt instance
 * 
 * Creation Requirements:
 * - Must be created blank with empty collections
 * - Must have valid creatorId
 * 
 * Key Properties:
 * @property sessionName - Display name for the session
 * @property teams - Map of team IDs to boolean (presence indicator)
 * @property participants - Map of user IDs to their team IDs
 * @property artifacts - Map of artifact IDs to boolean (availability indicator)
 * 
 * State Management:
 * @property startTime - Session start timestamp
 * @property endTime - Session end timestamp
 * @property isActive - Current session status
 */
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

/**
 * Team object representing a group within a session
 * 
 * Creation Requirements:
 * - Must be created blank with empty members
 * - Must be added to session while empty
 * 
 * Key Properties:
 * @property sessionId - ID of parent session (one-to-one relationship)
 * @property teamName - Display name for the team
 * @property members - Map of user IDs to boolean (membership indicator)
 */
export interface Team {
  sessionId: string;
  teamName: string;
  members: { [key: string]: boolean };
  // score removed as it's now tracked per-player only
}

/**
 * Artifact object representing an item to be found
 * 
 * Key Properties:
 * @property name - Display name for the artifact
 * @property description - Detailed artifact description
 * @property locationHint - Hint for finding the artifact
 * @property latitude - Geographic latitude
 * @property longitude - Geographic longitude
 * @property isChallenge - Indicates special challenge status
 * @property imageUrl - URL to the artifact's image
 * @property audioUrl - URL to the artifact's audio file
 */
export interface Artifact {
  name: string;
  description: string;
  locationHint: string;
  latitude: number;
  longitude: number;
  isChallenge: boolean;
  imageUrl?: string;  // New field for image
  audioUrl?: string;  // New field for audio
}

/**
 * Verification object representing the verification status of an artifact found by a user
 * 
 * Key Properties:
 * @property userId - ID of the user who found the artifact
 * @property artifactId - ID of the artifact found
 * @property sessionId - ID of the session in which the artifact was found
 * @property photoUrl - URL of the photo submitted for verification
 * @property status - Verification status ('pending', 'approved', 'rejected')
 * @property submittedAt - Timestamp of when the verification was submitted
 */
// export interface Verification {
//   userId: string;
//   artifactId: string;
//   sessionId: string;
//   photoUrl?: string;
//   status: 'pending' | 'approved' | 'rejected';
//   submittedAt: number;
// }

/**
 * Complete database schema definition
 * 
 * Top-level Collections:
 * @property users - All user objects indexed by ID
 * @property sessions - All session objects indexed by ID
 * @property teams - All team objects indexed by ID
 * @property artifacts - All artifact objects indexed by ID

 */
export interface DatabaseSchema {
  users: { [key: string]: User };
  sessions: { [key: string]: Session };
  teams: { [key: string]: Team };
  artifacts: { [key: string]: Artifact };
  // verifications: { [key: string]: Verification };
}
