const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrs6y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 5080;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: false }));

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const eventsCollection = client.db(`${process.env.DB_NAME}`).collection("museumEvents");
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orderInfo");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const adminsCollection = client.db(`${process.env.DB_NAME}`).collection("admins");


  app.get('/events', (req, res) =>{
    eventsCollection.find()
    .toArray((err, items) => {
        res.send(items);
    })
});


app.get('/event/:id', (req, res) => {
  eventsCollection.find({_id: ObjectId(req.params.id)})
  .toArray((err, documents) => {
      res.send(documents[0]);
  })
});

  app.post('/addEvent', (req, res) => {
    const newEvent = req.body;
    eventsCollection.insertOne(newEvent)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
});


app.post('/addOrder', (req, res) => {
  const order = req.body;
  ordersCollection.insertOne(order)
  .then(result => {
     res.send(result.insertedCount >0);
  })
});


app.get('/orderInfo', (req, res) =>{
  ordersCollection.find({})
  .toArray((err, items) => {
      res.send(items);
  })
});

app.get('/orders', (req, res) => {
  const queryEmail = req.query.email;
  if (queryEmail) {
    ordersCollection.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.status(200).send(documents);
      })
  }
  else {
    res.status(401).send('un-authorized access');
  }
});


app.post('/review', (req, res) => {
  const newReview = req.body;
  reviewsCollection.insertOne(newReview)
  .then(result => {
      res.send(result.insertedCount > 0);
  })
});

app.get('/testimonials', (req, res) =>{
  reviewsCollection.find()
  .toArray((err, items) => {
      res.send(items);
  })
});


app.get('/allUser', (req, res) => {
  ordersCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

app.post('/addAdmin', (req, res) => {
  const email = req.body.email;
  const adminName = req.body.name;
  let passNumber = req.body.password;

  adminsCollection.insertOne({ adminName,email,passNumber })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
});

app.delete('/deleteEvent/:id', (req, res)=>{
  const id = ObjectId(req.params.id);
  
  eventsCollection.findOneAndDelete({_id: id})
  .then(result => {
      res.send(result.deletedCount > 0);
  });
});


app.patch('/update/:id', (req, res) => {
  ordersCollection.updateOne({ _id: ObjectId(req.params.id)}, 
  {
      $set: {status: req.body.status}
  })
  .then(result =>{
      res.send(result.modifiedCount > 0);
  })
});


app.post('/isAdmin', (req, res)=> {
  const email = req.body.email;
  adminsCollection.find({email: email})
  .toArray((err, admins) => {
      res.send(admins.length > 0);
  })
});



});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})