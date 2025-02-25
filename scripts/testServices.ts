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
    await userService.setUsername('user1', 'Alice');
    await userService.setEmail('user1', 'alice@test.com');
    await userService.setUsername('user2', 'Bob');
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
    await userService.setUsername('user_A', 'Alice');
    await userService.createUser('user_B');
    await userService.setUsername('user_B', 'Ben');
    await userService.createUser('user_C');
    await userService.setUsername('user_C', 'Chris');
    await userService.createUser('user_D');
    await userService.setUsername('user_D', 'Dan');

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
    await userService.setUsername('user_E', 'Emily');
    await userService.createUser('user_F');
    await userService.setUsername('user_F', 'Felix');
    await userService.createUser('user_G');
    await userService.setUsername('user_G', 'Gabby');
    await userService.createUser('user_H');
    await userService.setUsername('user_H', 'Hannah');

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

async function runAllTests() {
  try {
    await runTest1();
    await runTest2();
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
