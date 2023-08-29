const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
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
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username; // Retrieve the username from the session
    if (!username) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const review = req.query.review; // Retrieve the review from the request query
  
    if (!review) {
      return res.status(400).json({ message: "Missing review" });
    }
  
    if (books[isbn]) {
      if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialize the reviews property as an empty object if it doesn't exist
      }
  
      if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review; // Update the existing review for the user
        res.send("Review Updated");
      } else {
        books[isbn].reviews[username] = review; // Add a new review for the user
        res.send("Review Added");
      }
    } else {
      res.status(404).send("Book not found");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username; // Retrieve the username from the session
    if (!username) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Delete the review for the specified user
        res.send("Review Deleted");
    } else {
        res.status(404).send("Review not found");
    }
});


  
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;