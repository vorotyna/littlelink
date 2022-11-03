const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  let shortString = "";
  // https://www.programiz.com/javascript/examples/generate-random-strings 
  shortString = Math.random().toString(36).substring(2, 8);
  return shortString;
}

function emailExists(users, email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return null;
}

function passwordExists(users, password) {
  for (let user in users) {
    if (password === users[user].password) {
      return true;
    }
  }
  return null;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  id = req.params.id;
  longUrl = urlDatabase[id];
  const templateVars = {
    id: id,
    longURL: longUrl,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  id = req.params.id;
  longUrl = urlDatabase[id];
  res.redirect(longUrl);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortString = generateRandomString();
  urlDatabase[shortString] = req.body.longURL;
  res.redirect(`/urls/${shortString}`); // Respond with "Ok" (we will replace this)
});

// Post request to delete an existing URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Post request to edit a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

// Post request the login route
app.post("/login", (req, res) => {
  if (!emailExists(users, req.body.email) || !passwordExists(users, req.body.password)) {
    return res.status(403).send('E-mail or password cannot be found!');
  } else {
    randomId = Object.keys(users).find(key => users[key].email === req.body.email);
    res.cookie('user_id', randomId);
    res.redirect("/urls");
  }
});

// Post request the logout route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Post request the registration route
app.post("/register", (req, res) => {
  let userRandomID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Empty email or password!');
  }
  else if (emailExists(users, req.body.email)) {
    return res.status(400).send('Email already exists!');
  }
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', userRandomID);
  console.log(users);
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});