function emailExists(usersDatabase, email) {
  for (let user in usersDatabase) {
    if (email === usersDatabase[user].email) {
      return true;
    }
  }
  return null;
}

function generateRandomString() {
  let shortString = "";
  // https://www.programiz.com/javascript/examples/generate-random-strings 
  shortString = Math.random().toString(36).substring(2, 8);
  return shortString;
}

module.exports = {
  emailExists,
  generateRandomString
};