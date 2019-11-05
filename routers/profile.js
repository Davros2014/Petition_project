// routers/profile.js

// file for moving profile routes from main index.js file

//router is a variable that has 'get' and 'post' methods

const express = require("express");
const router = express.Router();

module.exports = router;

// add add.get('/profile')
// add add.post('/profile')

// replace add in the line of code with router

// ie router.get or router.post

// if different methods but same url they can be formatted a little differently by combined the two

// eg

// router.route('/profile')
        .get((req, res) => {
                res.render('profile', {
                layout: "main"
                }
        })
        .post((req, res) => {
                res.render('profile', {
                layout: "main"
                }
        }) etc etc
