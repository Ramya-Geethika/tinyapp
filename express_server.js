const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

function generateRandomString() {
  let rand = Math.random().toString(36).substring(7, 1);
  return rand;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.post(('/urls/:shortURL/delete'), (req, res)=>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log('url: ',urlDatabase)
  res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  const generatedUrl = generateRandomString(); //generate a random string
  urlDatabase[generatedUrl] = req.body.longURL;  // add the new one to urlDatabase
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${generatedUrl}`); // redirect it to the new created url
});

app.get('/', (req, res)=>{
  res.send("Hello!")
});

app.get('/urls', (req, res)=>{
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    username: req.cookies['username']
     };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { shortURL, longURL, username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL', (req, res)=>{
  const shortURL = req.params.shortURL;
  for(let url in urlDatabase){
    if(url === shortURL)[
      urlDatabase[shortURL] = req.body.newURL
    ]
  }
  console.log('url: ',urlDatabase)
  res.redirect('/urls');
});

app.post('/login', (req, res)=>{
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls')
});

app.post('/logout', (req, res)=>{
  res.clearCookie('username');
  res.redirect('/urls')
});
// app.get("/urls", (req, res) => {
//   let templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });

// app.get('/', (req, res)=>{
//   res.send("Hello!")
// });

// app.get('/urls.json', (req, res)=>{
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res)=>{
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });

// app.get("/urls/new", (req, res) => {
//   res.render("urls_new");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

 
app.listen(PORT, ()=>{
  console.log(`Example app listening on port ${PORT}!`);
});