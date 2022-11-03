const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const e = require("express");
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  if (!(req.cookies.user_id in users)) {
    res.redirect('/login');
  } else {
    let urls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.cookies.user_id);
    const templateVars = {
      urls: Object.fromEntries(urls),
      user: users[req.cookies.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id in users) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id in users) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id in users) {
    const templateVars = {
      user: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get("/urls/:id", (req, res) => {
  id = req.params.id;
  if (!(id in urlDatabase)) {
    return res.status(404).send('Short URL not found!');
  } else if (req.cookies.user_id in users) {
    const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.cookies.user_id);
    const userUrlsObject = Object.fromEntries(userUrls);
    if (id in userUrlsObject) {
      longUrl = urlDatabase[id].longURL;
      const templateVars = {
        id: id,
        longURL: longUrl,
        user: users[req.cookies.user_id]
      };
      res.render("urls_show", templateVars);
    } else {
      return res.status(401).send('This URL does not belong to you!');
    }
  } else {
    return res.status(401).send('Must login!');
  }
});

app.get("/u/:id", (req, res) => {
  id = req.params.id;
  longUrl = urlDatabase[id].longURL;
  res.redirect(longUrl);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortString = generateRandomString();
  if (req.cookies.user_id in users) {
    urlDatabase[shortString] = { longURL: req.body.longURL, userId: req.cookies.user_id };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortString}`); // Respond with "Ok" (we will replace this)
  } else {
    return res.status(400).send('Please login first!');
  }
});

// Post request to delete an existing URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (id in urlDatabase) {
    if (req.cookies.user_id in users) {
      const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.cookies.user_id);
      const userUrlsObject = Object.fromEntries(userUrls);
      if (id in userUrlsObject) {
        const longURL = req.body.longURL;
        urlDatabase[id].longURL = longURL;
        delete urlDatabase[id];
        res.redirect("/urls");
      } else {
        return res.status(401).send('This does not belong to you!');
      }
    } else {
      return res.status(401).send('Please log in!!');
    }
  } else {
    return res.status(404).send('Id not found!!!!');
  }
});


// Post request to edit a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (id in urlDatabase) {
    if (req.cookies.user_id in users) {
      const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.cookies.user_id);
      const userUrlsObject = Object.fromEntries(userUrls);
      if (id in userUrlsObject) {
        const longURL = req.body.longURL;
        urlDatabase[id].longURL = longURL;
        res.redirect("/urls");
      } else {
        return res.status(401).send('This does not belong to you!');
      }
    } else {
      return res.status(401).send('Please log in!!');
    }
  } else {
    return res.status(404).send('Id not found!!!!');
  }
});

// Post request the login route
app.post("/login", (req, res) => {
  userRandomId = Object.keys(users).find(key => users[key].email === req.body.email);
  if (!emailExists(users, req.body.email) || !bcrypt.compareSync(req.body.password, users[userRandomId].password)) {
    return res.status(403).send('E-mail or password cannot be found!');
  } else {
    res.cookie('user_id', userRandomId);
    res.redirect("/urls");
  }
});

// Post request the logout route
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
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
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: hashedPassword
  };
  res.cookie('user_id', userRandomID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});