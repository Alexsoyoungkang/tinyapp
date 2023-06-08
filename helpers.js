// Helper function to generate random id
const generateRandomString = function() { // generating a "unique" Short URL id
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

// Helper function to find a user by email
// database = users
const getUserByEmail = function(email, database) {
  for (const eachUser in database) {
    if (database[eachUser].email === email) {
      return database[eachUser];
    }
  }
  return null; // Return null if user not found
};

module.exports = {
  generateRandomString,
  getUserByEmail
};