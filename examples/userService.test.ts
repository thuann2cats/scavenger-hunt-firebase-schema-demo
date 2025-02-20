// import { userService } from '../services/UserService';

// async function testUserService() {
//   try {
//     // Test creating a new user
//     const userId = 'testUser123';
//     await userService.createUser(userId, {
//       username: 'TestUser',
//       email: 'test@gatech.edu',
//       isAdmin: false
//     });

//     // Test getting the user
//     const user = await userService.getUser(userId);
//     console.log('Retrieved user:', user);

//     // Test updating user points
//     await userService.updateUserPoints(userId, 100);

//     // Test adding a session
//     await userService.addSessionToUser(userId, 'testSession123');

//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }

// // Run the tests
// testUserService();
