var express = require('express')
var app = express()
// var mailer = require('express-mailer')

app.post('/contact', function(req, res) {
    var formContent = req.params;
    var who = formContent['who'];
    var replyTo = formContent['reply-to'];
    var subject = formContent['subject'];
    var message = formContent['message'];
    res.send('hello!');
});