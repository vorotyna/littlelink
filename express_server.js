const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  let shortString = "";
  // https://www.programiz.com/javascript/examples/generate-random-strings 
  shortString = Math.random().toString(36).substring(2, 8);
  return shortString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  id = req.params.id;
  longUrl = urlDatabase[id];
  const templateVars = {
    id: id,
    longURL: longUrl,
    username: req.cookies["username"]
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
  username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

// Post request the logout route
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

