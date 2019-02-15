const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 3000
const morgan = require('morgan')
const bunyan = require('bunyan')
const aws = require('aws-sdk')
const MAX_ALLOWED_CONTENT_LENGTH = 5000

app.use(bodyParser.urlencoded({ extended: true }))
var reqlog = morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version :req[content-type] :req[content-length]" :status :res[content-length] ":referrer" ":user-agent"')

var log = bunyan.createLogger({name: "contact"});

aws.config.update({region: 'us-west-2'});
var credentials = new aws.SharedIniFileCredentials({profile: 'default'});
aws.config.credentials = credentials;

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

var buildSESRequest = function(replyTo, name, subject, message) {
    log.info('buildSESRequest called with' + [replyTo, name, subject, message].join(';'))
    return {
        Destination: {
            ToAddresses: ['raphaelsampaio@gmail.com']
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: "New message from " + name + "<" + replyTo + ">:" + "\n\n" + message
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: 'mailbot@raphaelsampaio.com',
        ReplyToAddresses: [replyTo]
    }
}

var sendEmail = function(reqBody) {
    log.info('sendEmail called with' + JSON.stringify(reqBody))
    var replyTo = reqBody.email
    var name = reqBody.name
    var subject = reqBody.subject
    var message = reqBody.message
    var sendMailReq = buildSESRequest(replyTo, name, subject, message)
    return new aws.SES({apiVersion: '2010-12-01'}).sendEmail(sendMailReq).promise()
}

app.post('/contact', cors(corsOptions), function(req, res) {
    log.info('new request')
    reqlog(req, res, function(err) {
        if(err) { 
            log.error(err)
            res.status(500).end() 
        }
        if(!validRequest(req)) { res.status(400).end() }
        log.info('valid request')
        sendEmail(req.body).then(function(data){
            res.status(200).end()
        }).catch(function(err) {
            log.error(err)
            res.status(500).end()
        })
    })
})

app.listen(port, () => log.info(`Example app listening on port ${port}!`))