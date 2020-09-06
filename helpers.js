const generateRandomString = function() {
  let rand = Math.random().toString(36).substring(7, 1);
  return rand;
};

const getUserByEmail = function(email, users) {
  for (let item in users) {
    if (users[item].email === email) {
      return item;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  let newUrlDatabase = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      newUrlDatabase[item] = {
        longURL: urlDatabase[item].longURL
      };
    }
  }
  return newUrlDatabase;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};