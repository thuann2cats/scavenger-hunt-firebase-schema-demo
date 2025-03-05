# Scavenger Hunt App for Georgia Tech

## Firebase CRUD Requirements and Rules for User, Session, Team, Artifact, and Verification Objects

### Key Object Relationships and Rules Overview

#### Users and Sessions
- Users can join multiple sessions.

#### Teams and Sessions
- Teams belong to exactly one session.
- Teams cannot be reused across sessions.

#### Users and Teams
- Users can join teams but only within the context of a session.
- A user can be part of only one team per session but may belong to different teams in different sessions.

#### Creating Objects
- Users, teams, and sessions are created as blank objects.
- Attributes are set later via update operations.

#### Associations
- Users must be added to a session before being added to a team in that session.
- Empty teams (i.e., with no members) must be added to a session before users can be assigned to the team.

#### Deletion Restrictions
- Users, teams, and sessions cannot be deleted if they have active associations.
- Within a session, removing a user from a team requires updates to both the user object and the team object.
- Teams can only be deleted if they are not part of any session and have no members.
- Users can only be deleted if they are not part of any sessions or teams.
- Sessions can only be deleted if they have no teams and no users.

**Deletion Process:**  
To delete a user or a team, UI programmers should:
1. Remove the user or team's associations in each session.
2. Ensure the user or team has no active associations.
3. Remove the user or team from all sessions.
4. Delete the user or team once it has no associations.

---

## CRUD Operations and Constraints

## User Schema

```typescript
export interface User { 
  username: string; 
  email: string; 
  profilePictureUrl?: string; 
  currentSession?: string; 
  sessionsJoined: { 
    [sessionId: string]: { 
      teamId?: string; 
      points: number; 
      foundArtifacts: { [artifactId: string]: boolean }; 
    }; 
  }; 
  isAdmin: boolean; 
  createdAt?: number; 
  updatedAt?: number; 
} 
```

### **User Operations**
#### **Create User**
- Create a blank user object with `sessionsJoined` as an empty object.

#### **Read User**
- Retrieve user object by ID.

#### **Update User**
- Atomic transactions must ensure data integrity across related objects.
- Updates allowed for:
  - `username`
  - `email`
  - `profilePictureUrl`
  - `currentSession`
  - `isAdmin`
- `createdAt` and `updatedAt` are auto-populated timestamps.
- `currentSession` can only be set to a session present in `sessionsJoined`.

#### **Add User to Session**
- Validate session existence.
- Ensure user is not already part of session.
- Update user’s `sessionsJoined`.
- Add user ID to session’s `participants`.

#### **Remove User from Session**
- Validate user is part of session.
- Ensure user is not part of a team in the session.
- Remove session from user’s `sessionsJoined`.
- Remove user ID from session’s `participants`.

#### **Assign User to Team in Session**
- Validate session and team existence.
- User must already be part of the session.
- Ensure user is not already in a team within this session.
- Update user’s `sessionsJoined[sessionId].teamId`.
- Add user ID to team’s `members`.
- Remove user ID from the previous team’s `members` if applicable.

#### **Remove User from Team in Session**
- Validate session and team existence.
- Ensure user is part of the team.
- Remove user from team’s `members`.
- Clear user’s `sessionsJoined[sessionId].teamId`.

#### **Add Artifact to User’s Found Artifacts in Session**
- Validate session and artifact existence.
- Validate artifact is part of the session’s artifacts.
- Ensure user is part of the session.
- Update user’s `sessionsJoined[sessionId].foundArtifacts` to add the artifact ID.

#### **Remove Artifact from User’s Found Artifacts in Session**
- Validate session existence.
- Ensure user is part of the session.
- Ensure artifact is part of the user’s `foundArtifacts` in that session.
- Update user’s `sessionsJoined[sessionId].foundArtifacts` to remove the artifact ID.

#### **Delete User**
- Validate user has no active associations with any session or team.

---

## Session Schema

```typescript
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
```

### **Session Operations**
#### **Create Session**
- Create a blank session object with empty teams and participants.

#### **Read Session**
- Retrieve session object by ID.

#### **Update Session**
- Updates allowed for:
  - `sessionName`
  - `creatorId`
  - `startTime`
  - `endTime`
  - `isActive`
- All team and participant changes must follow atomic operations.

#### **Add Team to Session**
- Validate team is not already part of another session.
- Validate team has no members.
- Add team ID to session’s `teams`.
- Update team’s `sessionId` field.

#### **Remove Team from Session**
- Validate team is part of the session.
- Ensure team has no members.
- Remove team ID from session’s `teams`.
- Clear team’s `sessionId`.

#### **Delete Session**
- Validate session has no participants and no teams.

---

## Team Schema

```typescript
export interface Team {
  sessionId: string;
  teamName: string;
  members: { [key: string]: boolean };
  // score removed as it's now tracked per-player only
}
```

### **Team Operations**
#### **Create Team**
- Create a blank team object with empty members.

#### **Read Team**
- Retrieve team object by ID.

#### **Update Team**
- Updates allowed for:
  - `teamName`

#### **Delete Team**
- Validate team has no members and is not part of any session.

---

## Error Messages for Operations

| **Operation** | **Error Message** |
|--------------|------------------|
| **Create User** | Users must be created as blank objects first. Attributes should be set later using update operations. |
| **Add User to Session** | Session does not exist. / User is already part of the session. |
| **Remove User from Session** | User is not part of the session. / User is still associated with a team in this session. Remove the user from the team first before removing from the session. |
| **Assign User to Team in Session** | Session does not exist. / Team does not exist in session. / User is not part of the session. / User is already part of a team in this session. |
| **Remove User from Team in Session** | Session does not exist. / Team does not exist in session. / User is not part of the team. |
| **Add Artifact to User’s Found Artifacts in Session** | Session does not exist. / Artifact does not exist in session. / User is not part of the session. |
| **Remove Artifact from User’s Found Artifacts in Session** | Session does not exist. / User is not part of the session. / Artifact is not in user’s found artifacts for this session. |
| **Delete User** | User still has associations with sessions or teams. Remove user from all teams and all sessions before deletion. |
| **Create Session** | Sessions must be created as blank objects first. Attributes should be set later using update operations. |
| **Add Team to Session** | Team is already part of a session. / Team has members. Teams can only be added to a session if they are empty. |
| **Remove Team from Session** | Team is not part of the session. / Team still has members. Remove all members from the team before removing it from the session. |
| **Delete Session** | Session still has associated teams or users. Remove all teams and users from the session before deletion. |
| **Create Team** | Teams must be created as blank objects first. Attributes should be set later using update operations. |
| **Delete Team** | Team still has members or is part of a session. Remove all members and remove the team from the session before deletion. |
| **Delete Artifact** | Artifact is still referenced in one or more users' `foundArtifacts`. Remove references before deletion. |

---

## General Guidance for Deletion Operations

To delete a user, team, or session, UI programmers should:
1. Remove associations between users and teams within each session.
2. Remove empty teams from sessions.
3. Remove unassociated users from sessions.
4. Delete unassociated users, teams, and empty sessions.

---




