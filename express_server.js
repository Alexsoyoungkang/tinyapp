const express = require("express");
const cookieParser = require("cookie-parser");
const app = express(); // creates an instance of the express application
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // let the Express app to use EJS as its templating engine.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // create/populate req.cookies

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


// URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User Database
const users = {
  abc123: {
    id: "abc123",
    email: "user@a.com",
    password: "123",
  },
  def456: {
    id: "def456",
    email: "user2@a.com",
    password: "456",
  },
};

// Helper function to find a user by email
const getUserByEmail = function(email) {
  for (const eachUser in users) {
    if (users[eachUser].email === email) {
      return users[eachUser];
    }
  }
  return null; // Return null if user not found
};

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] //Retrieve the user object directly from the users database using the user_id cookie value
  };
  res.render("urls_index", templateVars); //EJS knows to look inside the views directory for any template files
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { // route to handle the POST requests from our form
  const shortURL = generateRandomString(); // generate a random short URL
  const longURL = req.body.longURL; // get the long URL from the request body
  urlDatabase[shortURL] = longURL; // save the id-longURL pair to the urlDatabase
  res.redirect(`/urls/${shortURL}`); // redirect the user to the show page for the new short URL
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; // bring the longURL associated with the shortURL id
  if (longURL) {
    res.redirect(longURL); //redirect to its longURL
  } else {
    res.send("<html><body>Requested URL not found</body></html>\n");
  }
});

app.get("/", (req, res) => { // client sends a Get request to /
  res.send("Hello!");  // server sends the response back to the client
});

// Update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // short URL
  const newURL = req.body.longURL; // get the updated URL(name="longURL") from the request body
  urlDatabase[id] = newURL; // update the new long URL into the urlDatabase
  res.redirect("/urls");
});


// Delete
app.post("/urls/:id/delete", (req, res) => { //route that removes a URL resource
  const userInput = req.params.id;
  delete urlDatabase[userInput];
  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] // identify users by the user_id
  };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  const inputUserEmail = getUserByEmail(req.body.email).id; // grab the entered data from the form field
  res.cookie("user_id", inputUserEmail); // set the value, inputUserEmail to name("user_id")
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Register
app.get("/register", (req, res) => { // display the register form
  const templateVars = {
    user: users[req.cookies["user_id"]]
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
  if (getUserByEmail(email)) {
    return res.status(400).send("The email address provided is already exist.");
  }
  
  users[id] = {
    id : id,
    email: email,
    password: password
  };
  res.cookie("user_id", id); //set the cookie named "user_id" with the value of the generated ID(id)
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

