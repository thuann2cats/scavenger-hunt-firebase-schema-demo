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

async function runTests() {
  console.log('Starting service tests...');

  // Initialize services with test node
  const baseNode = 'SchemaTest_Thuan';
  
  // Clean up before starting tests
  await clearTestNode(baseNode);

  const userService = new UserService(baseNode);
  const teamService = new TeamService(baseNode);
  const sessionService = new SessionService(baseNode);
  const artifactService = new ArtifactService(baseNode);

  try {
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

    console.log('\nAll tests completed successfully! ✨');

  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }

  // Allow time for Firebase operations to complete
  await sleep(2000);
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Tests failed:', error);
    process.exit(1);
  });
