const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 3000
const morgan = require('morgan')
const MAX_ALLOWED_CONTENT_LENGTH = 5000

app.use(bodyParser.urlencoded({ extended: true }))
var logger = morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version :req[content-type] :req[content-length]" :status :res[content-length] ":referrer" ":user-agent"')

// var mailer = require('express-mailer')
var corsOptions = {
    origin: 'https://raphaelsampaio.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var validBody = function(body) {
    return (!!body && !!body.email && !!body.name && !!body.subject && !!body.message)
}

var validRequest = function(req) {
    return req.get('Content-Type').match(/application\/x-www-form-urlencoded/) &&
    (req.get('Content-Length') <= MAX_ALLOWED_CONTENT_LENGTH) && validBody(req.body)
    
}

app.post('/contact', cors(corsOptions), function(req, res) {
    logger(req, res, function(err) {
        if(err) return done(err)
        if(!validRequest(req)) { res.status(400).end() }
        res.status(200).end()
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))