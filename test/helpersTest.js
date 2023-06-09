const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = testUsers.userRandomID;
    assert.strictEqual(user, expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return true for a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = testUsers.userRandomID;
    assert.isTrue(user === expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return null for a user with invalid email', function() {
    const user = getUserByEmail("hello@example.com", testUsers);
    assert.isNull(user, "User should be undefined");
  });
});




