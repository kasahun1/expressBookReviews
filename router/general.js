const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let doesExist = require("./auth_users.js").doesExist;
// const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).json(Object.values(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const authorBooks = Object.values(books).filter(book => book.author === author);
  return res.status(200).json(authorBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const titleBooks = Object.values(books).filter(book => book.title === title);
  return res.status(200).json(titleBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const bookReview = books[isbn].reviews;
  if (!bookReview) {
      return res.status(404).json({ message: "bookReview not found" });
  }
  return res.status(200).json(bookReview);
});

// public_users.get('/axiosbooks', async (req, res) => {
//   try {
//     res.status(200).json(Object.values(books));
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching books' });
//   }
// });

public_users.get('/axiosbooks', (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(Object.values(books));
    } catch (error) {
      reject(new Error('Unexpected error'));
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: error.message }));
});

public_users.get('/promise-isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  // if (!book) {
  //     return res.status(404).json({ message: "Book not found" });
  // }
  // return res.status(200).json(book);
  return new Promise((resolve, reject) => {
    try {
      resolve(Object.values(book));
    } catch (error) {
      reject(new Error('Book not found'));
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: error.message }));

 });

 public_users.get('/promise-author/:author',function (req, res) {
  const { author } = req.params;
  const authorBooks = Object.values(books).filter(book => book.author === author);
  // return res.status(200).json(authorBooks);
  return new Promise((resolve, reject) => {
    try {
      resolve(Object.values(authorBooks));
    } catch (error) {
      reject(new Error('Book not found'));
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: error.message }));

});

public_users.get('/promise-title/:title',function (req, res) {
  const { title } = req.params;
  const titleBooks = Object.values(books).filter(book => book.title === title);
  // return res.status(200).json(titleBooks);
  return new Promise((resolve, reject) => {
    try {
      resolve(Object.values(titleBooks));
    } catch (error) {
      reject(new Error('Book not found'));
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: error.message }));
});

module.exports.general = public_users;
