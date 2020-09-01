const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let rand = Math.random().toString(36).substring(7, 1);
  return rand;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

delete urlDatabase.b2xVn2;
app.post(('/urls/:shortURL/delete'), (req, res)=>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log('url: ',urlDatabase);
  res.redirect('/urls');
});


// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
// });

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
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
})