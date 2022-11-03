const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080;
const { emailExists, generateRandomString } = require("./helpers");

// Setting EJS as view engine
app.set("view engine", "ejs");

/****** MIDDLEWARE ******/
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lisopiso']
}));

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
    password: bcrypt.hashSync("purple-monkey-dinosaur"),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk"),
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
  if (!(req.session.user_id in users)) {
    res.redirect('/login');
  } else {
    let urls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.session.user_id);
    const templateVars = {
      urls: Object.fromEntries(urls),
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id in users) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id in users) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: undefined
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id in users) {
    const templateVars = {
      user: users[req.session.user_id]
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
  } else if (req.session.user_id in users) {
    const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.session.user_id);
    const userUrlsObject = Object.fromEntries(userUrls);
    if (id in userUrlsObject) {
      longUrl = urlDatabase[id].longURL;
      const templateVars = {
        id: id,
        longURL: longUrl,
        user: users[req.session.user_id]
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
  console.log(req.body);
  const shortString = generateRandomString();
  if (req.session.user_id in users) {
    urlDatabase[shortString] = { longURL: req.body.longURL, userId: req.session.user_id };
    res.redirect(`/urls/${shortString}`);
  } else {
    return res.status(400).send('Please login first!');
  }
});

// Post request to delete an existing URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (id in urlDatabase) {
    if (req.session.user_id in users) {
      const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.session.user_id);
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
    if (req.session.user_id in users) {
      const userUrls = Object.entries(urlDatabase).filter(([key, value]) => value.userId === req.session.user_id);
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
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Empty email or password!');
  } else if (!emailExists(users, req.body.email) || !bcrypt.compareSync(req.body.password, users[userRandomId].password)) {
    return res.status(403).send('E-mail or password cannot be found!');
  } else {
    req.session.user_id = userRandomId;
    return res.redirect("/urls");
  }
});

// Post request the logout route
app.post("/logout", (req, res) => {
  req.session = null;;
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
  req.session.user_id = userRandomID;
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});