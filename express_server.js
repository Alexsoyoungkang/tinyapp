const express = require("express");
const app = express(); // creates an instance of the express application
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // let the Express app to use EJS as its templating engine.
app.use(express.urlencoded({ extended: true }));

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); //EJS knows to look inside the views directory for any template files
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new"); // show the form
});

app.post("/urls", (req, res) => { // route to handle the POST requests from our form
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString(); // generate a random short URL
  const longURL = req.body.longURL; // get the long URL from the request body
  urlDatabase[shortURL] = longURL; // save the id-longURL pair to the urlDatabase
  res.redirect(`/urls/${shortURL}`); // redirect the user to the show page for the new short URL
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => { // client sends a Get request to /
  res.send("Hello!");  // server sends the response back to the client
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //server sends the response using HTML code to the client
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

