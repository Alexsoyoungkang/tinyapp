const { generateRandomString, getUserByEmail } = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const app = express(); // creates an instance of the express application
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // let the Express app to use EJS as its templating engine.
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['sksmsgkftndltekvhrlsmsdjqtdj', 'rjsrkdgkwkgyehgkwkghkdlxldok'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Password hasher
const bcrypt = require("bcryptjs");

// URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "abc123",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "def456",
  },
};

// User Database
const users = {
  abc123: {
    id: "abc123",
    email: "user@a.com",
    password: bcrypt.hashSync("123", 10),
  },
  def456: {
    id: "def456",
    email: "user2@a.com",
    password: bcrypt.hashSync("456", 10),
  },
};

// Helper function to find id
const urlsForUser = function(id) {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

app.get("/urls", (req, res) => {
  const userId = req.session.user_id; // retrieve the user id from the cookies
  const user = users[userId]; // retrive the user object from the users object based on the user id

  if (!userId) {
    return res.status(401).send("Please login to view your URLs."); // error message when the user isn't looged in
  }
  const templateVars = {
    urls: urlsForUser(userId),
    user: user //Retrieve the user object directly from the users database using the user_id cookie value
  };
  res.render("urls_index", templateVars); //EJS knows to look inside the views directory for any template files
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!userId) {
    return res.redirect("/login"); // if the user isn't loggied in redirect to login
  }
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { // route to handle the POST requests from our form
  const userId = req.session.user_id; // retrieve the user id from the cookies

  if (!userId) {
    return res.status(401).send("Please login to create shorten URLs."); // if the user isn't loggied in send the error mssage
  }

  const shortURL = generateRandomString(); // generate a random short URL
  const longURL = req.body.longURL; // get the long URL from the request body
  urlDatabase[shortURL] = { // update to store an obj with longURL and userID keys and values
    longURL: longURL,
    userID: userId
  };
  res.redirect(`/urls/${shortURL}`); // redirect the user to the show page for the new short URL
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // short url ex) the value "b6UTxQ"
  const userId = req.session.user_id;
  const shortUrl = urlDatabase[id];

  // Check if the user is not logged in
  if (!userId) {
    return res.status(401).send("Please login to view this URL.");
  }

  // Check if the requested URL exists in the database
  if (!shortUrl) {
    return res.status(400).send("Requested URL does not exist.");
  }

  // Check if the URL belongs to the user
  if (shortUrl.userID !== userId) {
    return res.status(403).send("You do not have access to view this URL.");
  }

  const longURL = shortUrl.longURL;
  const templateVars = {
    id: id,
    longURL: longURL,
    user: users[userId]
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const shortUrl = urlDatabase[id];

  if (!shortUrl || !shortUrl.longURL) {
    return res.status(404).send("Requested Short URL does not exist.");
  }

  const longURL = shortUrl.longURL;
  res.redirect(longURL);
});



app.get("/", (req, res) => { // client sends a Get request to /
  res.send("Hello!");  // server sends the response back to the client
});

// Update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // short URL
  const userId = req.session.user_id; // retrieve the user id from the cookies

  if (!urlDatabase[id]) { // check if the URL exsits
    return res.status(404).send("Requested URL does not exist.");
  }

  if (!userId) { // check if user is logged in before editing URL
    return res.status(401).send("Please login to edit this URL.");
  }

  if (urlDatabase[id].userID !== userId) { // check if user is logged in before deleting URL
    return res.status(403).send("You do not have access to edit this URL.");
  }

  urlDatabase[id].longURL = req.body.longURL; // update the new long URL into the urlDatabase
  res.redirect("/urls");
});


// Delete
app.post("/urls/:id/delete", (req, res) => { //route that removes a URL resource
  const id = req.params.id;
  const userId = req.session.user_id; // retrieve the user id from the cookies

  if (!urlDatabase[id]) { // check if the URL exsits
    return res.status(404).send("Requested URL does not exist.");
  }

  if (!userId) { // check if user is logged in before deleting URL
    return res.status(401).send("Please login to delete this URL.");
  }

  if (urlDatabase[id].userID !== userId) { // check if the URL belongs to the user
    return res.status(403).send("You do not have access to delete this URL.");
  }

  delete urlDatabase[id]; // remove the URL from the urlDatabase
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const userId = req.session.user_id; // retrieve the user id from the cookies
  const user = users[userId]; // retrive the user object from the users object based on the user id
  
  if (userId) {
    return res.redirect("/urls"); // if the user is loggied in redirect to urls
  }

  const templateVars = {
    user: user // user = users[userId]
  };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) { // check if both email and password fields are provided
    return res.status(400).send("Please fill in required(Email and Password) fields.");
  }

  const user = getUserByEmail(email, users);

  if (!user) {  // check if the email is registered
    return res.status(403).send("Email you provided cannot be found");
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(400).send("Wrong password. Try again");
  }

  const userId = user.id; // grab the entered data from the form field
  req.session.user_id = userId; // set the value, userId to name("user_id")
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Register
app.get("/register", (req, res) => { // display the register form
  const userId = req.session.user_id;
  const user = users[userId];

  if (userId) {
    return res.redirect("urls");
  }

  const templateVars = {
    user: user
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {  // handle the registration form data
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // check if the e-mail or password are empty strings
  if (!email || !password) {
    return res.status(400).send("Please provide a username and password.");
  }

  // Check if the email already exists in the users object using the helper function
  if (getUserByEmail(email, users)) {
    return res.status(400).send("The email address provided is already exist.");
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id : id,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = id; //set the cookie named "user_id" with the value of the generated ID(id)
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //server sends the response using HTML code to the client
});

app.listen(PORT, () => { //listener
  console.log(`Example app listening on port ${PORT}!`);
});

