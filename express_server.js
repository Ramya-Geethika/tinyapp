const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { urlsForUser, getUserByEmail, generateRandomString } = require('./helpers');
const saltRounds = 10;

const bcrypt = require('bcrypt');
// const hashedPassword = bcrypt.hashSync(password, 10);


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(methodOverride('_method'));


// app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = { 
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

app.get('/', (req, res) => {
  const userId = req.session['user_id'];
  if (!users[userId]) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  let newUrlDatabase = urlsForUser(userId, urlDatabase);
  let templateVars = { urls: newUrlDatabase, user: users[userId] };
  if (users[userId]) {
    return res.render("urls_index", templateVars);
  } else {
    req.session['user_id'] = null;
    const err = "You need to register or login to access this page!";
    res.status(401).render('unauthorized', {...templateVars, err});
  }
});

app.post("/urls", (req, res) => {
  const generatedUrl = generateRandomString(); //generate a random string
  const userId = req.session['user_id'];
  if (!users[userId]) {
    const err = "You need to register first to create new URL";
    let templateVars = { err, user: null };
    return res.render('unauthorized', templateVars);
  }
  urlDatabase[generatedUrl] = { longURL : req.body.longURL, userID : userId };  // add the new one to urlDatabase
  // console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${generatedUrl}`); // redirect it to the new created url
});

app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId]};
  if (users[userId]) {
    return res.render("urls_new", templateVars);
  }
  else {
    return res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!urlDatabase[shortURL]) {
    const err = "Short URL does not exist!";
    let templateVars = {
      err,
      user: users[userId]
    };
    return res.render('unauthorized', templateVars);
  }
  if (users[userId] && urlDatabase[shortURL].userID === userId) {
    const longURL = urlDatabase[shortURL].longURL;
    let templateVars = {
      shortURL,
      longURL,
      user: users[userId]
    };
    return res.render("urls_show", templateVars);
  }
  const err = "Access denied!";
  let templateVars = {
    err,
    user: users[userId]
  };
  res.render('unauthorized', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!urlDatabase[shortURL]) {
    const err = "URL does not exist!";
    let templateVars = {
      err,
      user: users[userId]
    };
    return res.render('unauthorized', templateVars);
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.put('/urls/:shortURL', (req, res)=>{
  const shortURL = req.params.shortURL;
  const userId = req.session['user_id'];
  if (!users[userId]) {
    const err = "You need to register or login to edit URL!";
    let templateVars = {
      err,
      user: null
    };
    return res.render('unauthorized', templateVars);
  }
  if (urlDatabase[shortURL].userID !== userId) {
    const err = "You can not edit others URL!";
    let templateVars = {
      err,
      user: users[userId]
    };
    return res.render('unauthorized', templateVars);
  }
  for (let url in urlDatabase) {
    if (url === shortURL) {
      urlDatabase[shortURL].longURL = req.body.newURL;
    }
  }
  res.redirect('/urls');
});

app.delete('/urls/:shortURL', (req, res)=>{
  console.log('fsg');
  const userId = req.session['user_id'];
  const shortURL = req.params.shortURL;
  if (!users[userId]) {
    const err = "You need to register to delete URL first";
    let templateVars = { err, user: null };
    return res.render('unauthorized', templateVars);
  }
  if (urlDatabase[shortURL].userID !== userId) {
    const err = "You can not delete others URL";
    let templateVars = { err, user: users[userId] };
    return res.render('unauthorized', templateVars);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/register', (req, res)=>{
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId] };
  if (users[userId]) {
    return res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  let templateVars = { user: null };
  if (email === '' || password === '') {
    const err = "Email and pasword are required!";
    return res.render('unauthorized', {...templateVars, err});
  }
  if (getUserByEmail(email, users)) {
    const err = "Email exist!";
    return res.render('unauthorized', {...templateVars, err});
  }
  const id = generateRandomString();
  const hashPass = bcrypt.hashSync(password, saltRounds);
  users[id] = { id, email, password: hashPass };
  req.session['user_id'] = id;
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  const userId = req.session['user_id'];
  let templateVars = { user: users[userId] };
  if (users[userId]) {
    return res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let templateVars = {
    user: null
  };
  if (email === '' || password === '') {
    const err = "Should not be empty";
    return res.render('unauthorized', {...templateVars, err});
  }
  const userId = getUserByEmail(email, users);
  const user = users[userId];
  if (!userId || !bcrypt.compareSync(password, user.password)) {
    const err = "Email or pasword doesnot match";
    return res.render('unauthorized', {...templateVars, err});
  }
  req.session['user_id'] = user.id;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});