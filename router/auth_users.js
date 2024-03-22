const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: 'user', password: 'password' }];

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const isValid = (username)=>{ //returns boolean
  if (username.length < 2) {
    return false;
}
const alphanumericRegex = /^[a-zA-Z0-9]+$/;
if (!alphanumericRegex.test(username)) {
    return false;
}
return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access');
      // , { expiresIn: 60 * 60 }
      req.headers.authorization = {
        accessToken,username
    }
    return res.status(200).send({message: "User successfully logged in", accessToken});
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
    const { review } = req.body;
    const accessToken = req.headers.authorization ? req.headers.authorization.startsWith("Bearer") ?  req.headers.authorization.split(" ")[1] : null : null ;

    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    try {
        const decoded = jwt.verify(accessToken, 'access');
        const username = decoded.username;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Add the review to the book's reviews
        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Review added successfully" });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
    const accessToken = req.headers.authorization ? req.headers.authorization.startsWith("Bearer") ?  req.headers.authorization.split(" ")[1] : null : null ;

    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    try {
        const decoded = jwt.verify(accessToken, 'access');
        const username = decoded.username;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

          // Check if review exists for the user
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review
    delete books[isbn].reviews[username];


        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.doesExist = doesExist;