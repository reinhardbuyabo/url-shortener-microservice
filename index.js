require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require("mongodb")
const client = new MongoClient(process.env.DB_URL)
const urlparser = require('url')
const dns = require('dns')
const db = client.db("urlshortener")
const urls = db.collection("urls")
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true})) // we're using this middleware to access req.body

app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if(!address){
      res.json({error: 'Invalid Url'})
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url: req.body.url,
        short_url: urlCount
        }
      const result = await urls.insertOne(urlDoc)
      console.log(result)
      res.json({
        original_url: url, 
        short_url: urlCount
      })
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({short_url: parseInt(shorturl)})
  res.redirect(urlDoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
