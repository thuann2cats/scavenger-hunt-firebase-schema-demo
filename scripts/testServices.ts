/**
 * Firebase Service Layer Integration Tests
 * ======================================
 * 
 * Purpose:
 * These tests verify the data integrity and operation sequencing of the Firebase service layer.
 * They ensure proper creation, association, and deletion of objects following the schema rules.
 * 
 * Files Being Tested:
 * - services/UserService.ts: User management and associations
 * - services/TeamService.ts: Team management and membership
 * - services/SessionService.ts: Session management and relationships
 * - services/ArtifactService.ts: Artifact management and discovery
 * 
 * Prerequisites:
 * 1. Node.js (v16+) installed
 * 2. Firebase project set up with Realtime Database
 * 3. Firebase configuration in firebaseConfig.ts
 * 
 * Setup:
 * 1. Install required dependencies:
 *    npm install
 * 
 * 2. Install tsx globally (if not already installed):
 *    npm install -g tsx
 * 
 *    What is tsx?
 *    - tsx is a Node.js runtime for TypeScript and ESM
 *    - It allows direct execution of TypeScript files without compilation
 * 
 * Running the Tests:
 *    tsx <path to the file>/testServices.ts
 * 
 * Test Suites:
 * 1. Basic CRUD (Test1)
 *    - Tests basic object creation
 *    - Tests attribute setting
 *    - Tests simple associations
 *    - Tests proper deletion order
 * 
 * 2. Complex Operations (Test2)
 *    - Tests multi-session scenarios
 *    - Tests team assignments
 *    - Tests artifact finding mechanics
 *    - Tests error conditions
 * 
 * 3. Validation Rules (Test3)
 *    - Tests invalid operations
 *    - Tests proper operation sequencing
 *    - Tests state transitions
 *    - Verifies final database state
 * 
 * Database Impact:
 * Tests write to isolated nodes:
 * - SchemaTest_Thuan_Test1
 * - SchemaTest_Thuan_Test2
 * - SchemaTest_Thuan_Test3
 * 
 * Each test cleans up its node before starting.
 * 
 */

import { UserService } from '../services/UserService';
import { TeamService } from '../services/TeamService';
import { SessionService } from '../services/SessionService';
import { ArtifactService } from '../services/ArtifactService';
import { database } from '../firebaseConfig';
import { ref, remove } from 'firebase/database';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearTestNode(baseNode: string) {
  console.log(`Clearing test node: ${baseNode}`);
  await remove(ref(database, baseNode));
  await sleep(1000); // Wait for cleanup to complete
  console.log('Test node cleared');
}

async function runTest1() {
  console.log('\nStarting Test 1...');
  const baseNode = 'SchemaTest_Thuan_Test1';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const teamService = new TeamService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Original test steps moved here
    console.log('\nTest 1: Basic CRUD Operations');
    
    // Step 1: Create blank objects
    console.log('\nStep 1: Creating blank objects...');
    await userService.createUser('user1');
    await userService.createUser('user2');
    await teamService.createTeam('team1');
    await teamService.createTeam('team2');
    await sessionService.createSession('session1', 'admin1');
    await artifactService.createArtifact('artifact1');
    console.log('✓ Created blank objects');

    // Step 2: Set basic attributes
    console.log('\nStep 2: Setting basic attributes...');
    await userService.setDisplayName('user1', 'Alice');  // Changed from setUsername
    await userService.setEmail('user1', 'alice@test.com');
    await userService.setDisplayName('user2', 'Bob');
    await userService.setEmail('user2', 'bob@test.com');
    
    await teamService.setTeamName('team1', 'Red Team');
    await teamService.setTeamName('team2', 'Blue Team');
    
    await sessionService.setSessionName('session1', 'Test Hunt');
    await sessionService.setTimes('session1', Date.now(), Date.now() + 3600000);
    
    await artifactService.setName('artifact1', 'Golden Key');
    await artifactService.setDescription('artifact1', 'A special key');
    await artifactService.setCoordinates('artifact1', 1.234, 5.678);
    console.log('✓ Set basic attributes');

    // Step 3: Test associations in correct order
    console.log('\nStep 3: Testing associations...');
    // Add artifact to session
    await sessionService.addArtifact('session1', 'artifact1');
    console.log('✓ Added artifact to session');

    // Add empty teams to session
    await sessionService.addTeam('session1', 'team1');
    await sessionService.addTeam('session1', 'team2');
    console.log('✓ Added teams to session');

    // Add users to session
    await userService.addUserToSession('user1', 'session1');
    await userService.addUserToSession('user2', 'session1');
    console.log('✓ Added users to session');

    // Assign users to teams
    await userService.assignUserToTeam('user1', 'session1', 'team1');
    await userService.assignUserToTeam('user2', 'session1', 'team2');
    console.log('✓ Assigned users to teams');

    // Add found artifact
    await userService.addFoundArtifact('user1', 'session1', 'artifact1');
    console.log('✓ Added found artifact');

    // Step 4: Test removal in reverse order
    console.log('\nStep 4: Testing removal in reverse order...');
    // Remove found artifact
    await userService.removeFoundArtifact('user1', 'session1', 'artifact1');
    console.log('✓ Removed found artifact');

    // Remove users from teams
    await userService.removeUserFromTeam('user1', 'session1');
    await userService.removeUserFromTeam('user2', 'session1');
    console.log('✓ Removed users from teams');

    // Remove users from session
    await userService.removeUserFromSession('user1', 'session1');
    await userService.removeUserFromSession('user2', 'session1');
    console.log('✓ Removed users from session');

    // Remove teams from session
    await sessionService.removeTeam('session1', 'team1');
    await sessionService.removeTeam('session1', 'team2');
    console.log('✓ Removed teams from session');

    // Remove artifact from session
    await sessionService.removeArtifact('session1', 'artifact1');
    console.log('✓ Removed artifact from session');

    // Step 5: Delete blank objects
    console.log('\nStep 5: Deleting blank objects...');
    await sessionService.deleteSession('session1');
    await teamService.deleteTeam('team1');
    await teamService.deleteTeam('team2');
    await userService.deleteUser('user1');
    await userService.deleteUser('user2');
    await artifactService.deleteArtifact('artifact1');
    console.log('✓ Deleted all objects');

    console.log('\nTest 1 completed successfully! ✨');
  } catch (error) {
    console.error('Test 1 failed:', error);
    throw error;
  }
}

async function runTest2() {
  console.log('\nStarting Test 2: Complex Operations and Validation Test');
  const baseNode = 'SchemaTest_Thuan_Test2';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const teamService = new TeamService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Section 1: Initial Session Setup and Validation
    console.log('\nCreating and testing sessions...');
    await sessionService.createSession('session1', 'admin1');
    await sessionService.createSession('session2', 'admin1');
    // State: Two empty sessions exist

    // Test session deletion (empty session)
    await sessionService.deleteSession('session2');
    // State: Only session1 remains

    // Section 2: User Creation and Session Association
    console.log('\nCreating users and adding to session1...');
    await userService.createUser('user_A');
    await userService.setDisplayName('user_A', 'Alice');
    await userService.createUser('user_B');
    await userService.setDisplayName('user_B', 'Ben');
    await userService.createUser('user_C');
    await userService.setDisplayName('user_C', 'Chris');
    await userService.createUser('user_D');
    await userService.setDisplayName('user_D', 'Dan');

    await userService.addUserToSession('user_A', 'session1');
    await userService.addUserToSession('user_B', 'session1');
    await userService.addUserToSession('user_C', 'session1');
    await userService.addUserToSession('user_D', 'session1');
    // State: session1 has 4 users (A,B,C,D), no teams

    // Test deletion restrictions
    try {
      await userService.deleteUser('user_A');
      throw new Error('Should not be able to delete user_A');
    } catch (e: Error | any) {
      if (!e.message.includes('session associations')) throw e;
    }

    try {
      await sessionService.deleteSession('session1');
      throw new Error('Should not be able to delete session1');
    } catch (e: Error | any) {
      if (!e.message.includes('active participants')) throw e;
    }

    // Section 3: Team Creation and Session Association
    console.log('\nCreating teams and adding to session1...');
    await teamService.createTeam('team1');
    await teamService.createTeam('team2');
    await teamService.createTeam('team3');

    await sessionService.addTeam('session1', 'team1');
    await sessionService.addTeam('session1', 'team2');
    await sessionService.addTeam('session1', 'team3');
    // State: session1 has 4 users and 3 teams, but no associations between them

    // Test team deletion restrictions
    try {
      await teamService.deleteTeam('team1');
      throw new Error('Should not be able to delete team1');
    } catch (e: Error | any) {
      if (!e.message.includes('Remove team from session')) throw e;
    }

    // Section 4: Team Assignment
    console.log('\nAssigning users to teams in session1...');
    await userService.assignUserToTeam('user_A', 'session1', 'team1');
    await userService.assignUserToTeam('user_B', 'session1', 'team1');
    await userService.assignUserToTeam('user_C', 'session1', 'team2');
    await userService.assignUserToTeam('user_D', 'session1', 'team2');
    // State: Team1(A,B), Team2(C,D), Team3(empty)

    // Remove empty team from session
    await sessionService.removeTeam('session1', 'team3');
    // State: session1 now has only team1 and team2

    // Section 5: Artifact Setup and Testing
    console.log('\nSetting up artifacts and testing find mechanics...');
    await artifactService.createArtifact('artifact1');
    await artifactService.createArtifact('artifact2');
    await artifactService.createArtifact('artifact3');

    await sessionService.addArtifact('session1', 'artifact1');
    await sessionService.addArtifact('session1', 'artifact2');
    await sessionService.addArtifact('session1', 'artifact3');

    // User B finds artifacts 1 and 2
    await userService.addFoundArtifact('user_B', 'session1', 'artifact1');
    await userService.addFoundArtifact('user_B', 'session1', 'artifact2');
    await userService.updatePoints('user_B', 'session1', 20);

    // User D finds artifact 3
    await userService.addFoundArtifact('user_D', 'session1', 'artifact3');
    await userService.updatePoints('user_D', 'session1', 10);

    // Test artifact deletion restrictions
    try {
      await artifactService.deleteArtifact('artifact1');
      throw new Error('Should not be able to delete artifact1');
    } catch (e: Error | any) {
      if (!e.message.includes('part of an active session')) throw e;
    }

    // Section 6: User Movement Testing
    // Test user removal and deletion restrictions
    console.log('\nTesting user removal and deletion restrictions...');
    // Remove user A from team (should succeed)
    await userService.removeUserFromTeam('user_A', 'session1');
    console.log('✓ Removed user A from team 1');

    // Try to delete user A (should fail as still in session1)
    try {
      await userService.deleteUser('user_A');
      throw new Error('Should not be able to delete user_A while in session');
    } catch (e: Error | any) {
      if (!e.message.includes('session associations')) throw e;
    }
    console.log('✓ Verified user A cannot be deleted while in session');


    // Try to remove user B from session (should fail due to team membership)
    try {
      await userService.removeUserFromSession('user_B', 'session1');
      throw new Error('Should not be able to remove user_B from session1');
    } catch (e: Error | any) {
      if (!e.message.includes('Remove user from team first')) throw e;
    }

    // Section 7: Multi-session Testing
    console.log('\nTesting multi-session scenarios...');
    await sessionService.createSession('session2', 'admin1');
    
    // Add users to session2
    await userService.addUserToSession('user_B', 'session2');
    await userService.addUserToSession('user_C', 'session2');
    await userService.addUserToSession('user_D', 'session2');
    
    // Remove users from session2 (should work as these users have no team associations)
    await userService.removeUserFromSession('user_B', 'session2');
    await userService.removeUserFromSession('user_C', 'session2');
    await userService.removeUserFromSession('user_D', 'session2');

    // Try deleting users (should fail due to session1 associations)
    try {
      await userService.deleteUser('user_B');
      throw new Error('Should not be able to delete user_B');
    } catch (e: Error | any) {
      if (!e.message.includes('session associations')) throw e;
    }

    // Re-add users to session2
    await userService.addUserToSession('user_B', 'session2');
    await userService.addUserToSession('user_C', 'session2');
    await userService.addUserToSession('user_D', 'session2');

    // Try deleting session2 (should fail due to participants)
    try {
      await sessionService.deleteSession('session2');
      throw new Error('Should not be able to delete session2');
    } catch (e: Error | any) {
      if (!e.message.includes('active participants')) throw e;
    }

    // Section 8: Final User and Team Setup
    console.log('\nSetting up final users and teams...');
    // Create and add new users
    await userService.createUser('user_E');
    await userService.setDisplayName('user_E', 'Emily');
    await userService.createUser('user_F');
    await userService.setDisplayName('user_F', 'Felix');
    await userService.createUser('user_G');
    await userService.setDisplayName('user_G', 'Gabby');
    await userService.createUser('user_H');
    await userService.setDisplayName('user_H', 'Hannah');

    // Add new users to session2
    await userService.addUserToSession('user_E', 'session2');
    await userService.addUserToSession('user_F', 'session2');
    await userService.addUserToSession('user_G', 'session2');
    await userService.addUserToSession('user_H', 'session2');

    // Add team3 to session2 and assign users
    await sessionService.addTeam('session2', 'team3');
    await userService.assignUserToTeam('user_B', 'session2', 'team3');
    await userService.assignUserToTeam('user_C', 'session2', 'team3');
    await userService.assignUserToTeam('user_D', 'session2', 'team3');

    // Verify user B has no artifacts in session2
    const userB = await userService.getUser('user_B');
    if (userB?.sessionsJoined['session2']?.foundArtifacts && 
        Object.keys(userB.sessionsJoined['session2'].foundArtifacts).length > 0) {
      throw new Error('User B should have no artifacts in session2');
    }

    // Try to remove team3 from session2 (should fail due to members)
    try {
      await sessionService.removeTeam('session2', 'team3');
      throw new Error('Should not be able to remove team3 from session2');
    } catch (e: Error | any) {
      if (!e.message.includes('Team must be empty')) throw e;
    }

    // Remove player H from session2 (should work as not in team)
    await userService.removeUserFromSession('user_H', 'session2');

    console.log('\nTest 2 completed successfully! ✨');
  } catch (error) {
    console.error('Test 2 failed:', error);
    throw error;
  }
}

async function runTest3() {
  console.log('\nStarting Test 3: Testing Validation Rules and State Transitions');
  const baseNode = 'SchemaTest_Thuan_Test3';
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const teamService = new TeamService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
    // Initial setup: Create users
    console.log('\nCreating users...');
    await userService.createUser('user_A');
    await userService.setDisplayName('user_A', 'Alice');
    await userService.createUser('user_B');
    await userService.setDisplayName('user_B', 'Ben');
    await userService.createUser('user_C');
    await userService.setDisplayName('user_C', 'Chris');
    await userService.createUser('user_D');
    await userService.setDisplayName('user_D', 'Dan');
    // State: 4 users exist, no sessions yet

    // Create session and teams
    console.log('\nCreating session and teams...');
    await sessionService.createSession('session1', 'admin1');
    await teamService.createTeam('team1');
    await teamService.createTeam('team2');
    await teamService.createTeam('team3');
    // State: 1 session and 3 teams exist, no associations

    // Test invalid team assignment
    console.log('\nTesting invalid team assignment...');
    try {
      await userService.assignUserToTeam('user_A', 'session1', 'team1');
      throw new Error('Should not be able to assign user to team not in session');
    } catch (e: Error | any) {
      if (!e.message.includes('User is not part of this session')) throw e;
    }

    // Add team1 to session1
    await sessionService.addTeam('session1', 'team1');
    // State: session1 has team1, no users yet

    // Test invalid user assignment to team
    try {
      await userService.assignUserToTeam('user_A', 'session1', 'team1');
      throw new Error('Should not be able to assign user not in session to team');
    } catch (e: Error | any) {
      if (!e.message.includes('User is not part of this session')) throw e;
    }

    // Add user_A to session
    await userService.addUserToSession('user_A', 'session1');
    // State: session1 has team1 and user_A, but not connected

    // Test invalid team assignments
    try {
      await userService.assignUserToTeam('user_A', 'session1', 'team2');
      throw new Error('Should not be able to assign to team not in session');
    } catch (e: Error | any) {
      if (!e.message.includes('Team does not belong to this session')) throw e;
    }

    // Test invalid team removal
    try {
      await sessionService.removeTeam('session1', 'team2');
      throw new Error('Should not be able to remove non-existent team');
    } catch (e: Error | any) {
      if (!e.message.includes('Team is not part of this session')) throw e;
    }

    // Add remaining users and teams to session
    console.log('\nAdding remaining users and teams...');
    await userService.addUserToSession('user_B', 'session1');
    await userService.addUserToSession('user_C', 'session1');
    await userService.addUserToSession('user_D', 'session1');
    await sessionService.addTeam('session1', 'team2');
    await sessionService.addTeam('session1', 'team3');
    // State: session1 has all users and teams, no assignments

    // Create artifacts
    console.log('\nSetting up artifacts...');
    await artifactService.createArtifact('at1');
    await artifactService.createArtifact('at2');
    await artifactService.createArtifact('at3');
    // State: 3 artifacts exist, not in session

    // Test invalid artifact finding
    try {
      await userService.addFoundArtifact('user_A', 'session1', 'at1');
      throw new Error('Should not be able to find artifact not in session');
    } catch (e: Error | any) {
      if (!e.message.includes('Artifact is not part of this session')) throw e;
    }

    // Add artifacts to session
    await sessionService.addArtifact('session1', 'at1');
    await sessionService.addArtifact('session1', 'at2');
    await sessionService.addArtifact('session1', 'at3');
    // State: session1 now has all artifacts

    // Assign users to teams
    console.log('\nAssigning users to teams...');
    await userService.assignUserToTeam('user_A', 'session1', 'team1');
    await userService.assignUserToTeam('user_B', 'session1', 'team1');
    await userService.assignUserToTeam('user_C', 'session1', 'team2');
    await userService.assignUserToTeam('user_D', 'session1', 'team2');
    // State: team1(A,B), team2(C,D), team3(empty)

    // Record artifact findings and points
    console.log('\nRecording artifact findings...');
    await userService.addFoundArtifact('user_A', 'session1', 'at1');
    await userService.updatePoints('user_A', 'session1', 10);
    await userService.addFoundArtifact('user_B', 'session1', 'at2');
    await userService.updatePoints('user_B', 'session1', 10);
    // State: A found at1, B found at2

    // Test invalid removals
    console.log('\nTesting removal restrictions...');
    try {
      await userService.removeUserFromSession('user_A', 'session1');
      throw new Error('Should not be able to remove user from session while in team');
    } catch (e: Error | any) {
      if (!e.message.includes('Remove user from team first')) throw e;
    }

    try {
      await sessionService.removeTeam('session1', 'team2');
      throw new Error('Should not be able to remove team with members');
    } catch (e: Error | any) {
      if (!e.message.includes('Team must be empty')) throw e;
    }

    try {
      await sessionService.removeArtifact('session1', 'at1');
      throw new Error('Should not be able to remove found artifact');
    } catch (e: Error | any) {
      if (!e.message.includes('found by users')) throw e;
    }

    // Remove and delete artifact at2
    console.log('\nTesting artifact removal and deletion...');
    await userService.removeFoundArtifact('user_B', 'session1', 'at2');
    await sessionService.removeArtifact('session1', 'at2');
    await artifactService.deleteArtifact('at2');
    // State: at2 completely removed

    // Verify final state
    console.log('\nVerifying final state...');
    const session = await sessionService.getSession('session1');
    if (!session) throw new Error('Session not found');
    
    // Verify teams in session
    const teams = await sessionService.listSessionTeams('session1');
    if (!teams.includes('team1') || !teams.includes('team2') || !teams.includes('team3')) {
      throw new Error('Missing expected teams in session');
    }

    // Verify team memberships
    const team1Members = await teamService.listTeamMembers('team1');
    const team2Members = await teamService.listTeamMembers('team2');
    const team3Members = await teamService.listTeamMembers('team3');
    
    if (!team1Members.includes('user_A') || !team1Members.includes('user_B')) {
      throw new Error('Team 1 missing expected members');
    }
    if (!team2Members.includes('user_C') || !team2Members.includes('user_D')) {
      throw new Error('Team 2 missing expected members');
    }
    if (team3Members.length !== 0) {
      throw new Error('Team 3 should be empty');
    }

    // Verify artifacts
    const artifacts = Object.keys(session.artifacts);
    if (!artifacts.includes('at1') || !artifacts.includes('at3') || artifacts.includes('at2')) {
      throw new Error('Unexpected artifacts state');
    }

    console.log('\nTest 3 completed successfully! ✨');
  } catch (error) {
    console.error('Test 3 failed:', error);
    throw error;
  }
}

async function runAllTests() {
  try {
    await runTest1();
    await runTest2();
    await runTest3();  // Add this line
    console.log('\nAll tests completed successfully! ✨');
  } catch (error) {
    console.error('Tests failed:', error);
    process.exit(1);
  }
  
  // Allow time for Firebase operations to complete
  await sleep(2000);
  process.exit(0);
}

runAllTests();
