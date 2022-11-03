const { assert } = require('chai');
const { emailExists } = require('../helpers.js');

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

describe('emailExists', function() {
  it('returns true if this email exists in database', function() {
    const findEmail = emailExists(testUsers, 'user@example.com');
    const expectedOutput = true;
    assert.strictEqual(findEmail, expectedOutput);
  });
  it('returns null if this email does not exists in database', function() {
    const findEmail = emailExists(testUsers, 'hello@example.com');
    const expectedOutput = null;
    assert.strictEqual(findEmail, expectedOutput);
  });
  it('returns null if an email is not entered', function() {
    const findEmail = emailExists(testUsers, '');
    const expectedOutput = null;
    assert.strictEqual(findEmail, expectedOutput);
  });
});


