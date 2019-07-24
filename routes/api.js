/*
*
*
*       Complete the API routing below
*       
*       
*/

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var dbConnection;

function connectToDb() {
  if (!dbConnection) {
    dbConnection = MongoClient.connect(process.env.DB, { useNewUrlParser: true });
  }
  return dbConnection;
}
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res, next) {
      const { query } = req;
      if (Object.prototype.hasOwnProperty.call(query, 'open')) {
        query.open = false;
      }
      connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
          db.collection('book').find(query).toArray()
            .then(docs => res.send(docs))
            .catch(err => Promise.reject(err));
        })
        .catch(next);
    })
    
    .post(function (req, res, next){
      var title = req.body.title;
      var newBook = {title: title, comment:[], _id: ObjectId()};
    
      connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
          
          db.collection('book').insertOne(newBook);
        })
        .then(res.json(newBook))
        .catch(next);
    
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res, next){
      //if successful response will be 'complete delete successful'
      connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
          
          db.collection('book').remove();
        })
        .then(res.send("complete delete successful"))
        .catch(next);
    
      //response will contain new book object including atleast _id and title
    
    });

  app.route('/api/books/:id')
    .get(function (req, res, next) {
      connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
          db.collection('book').findOne({ _id: ObjectId(req.params.id) })
            .then((doc) => doc === null ? res.send('no book exists') : res.json(doc))
            .catch((err) => Promise.reject(err));
        })
        .catch(next);
    })
    
    .post(function(req, res, next){
      var id = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
           db.collection('book').findOneAndUpdate(
            { _id: ObjectId(req.params.id) },
            { $push: { comment: req.body.comment } },
            { returnOriginal: false }
          )
            .then((doc) => (
              doc.value === null ? res.send('no book exists') : res.json(doc.value)
            ))
            .catch((err) => Promise.reject(err));
        })
        .catch(next);
    })
    
    .delete(function(req, res, next){
      var id = req.params.id;
      connectToDb()
        .then((client) => {
          var db = client.db('Peronal-Library');
          db.collection('book').deleteOne({ _id: ObjectId(req.params.id) })
            .then((doc) => doc === null ? res.send('no book exists') : res.json(doc))
            .catch((err) => Promise.reject(err));
        })
        .catch(next);
    });
  
};
