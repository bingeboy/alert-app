//twilio info:
var myphone = 'NUMBER_HERE'
,twilioNumber = 'TWILIO_NUMBER';

var express    = require('express')
    , client   = require('twilio')() //sid and token stored on hardware
    , fs       = require('fs')
    , http     = require('http')
    , util     = require('util')
    , path     = require('path')
    , routes   = require('./routes/routes')
    , request  = require('request');

var app = express();


/*
 * connect middleware
 */
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/uploads' }));
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler());
});


var options = {
    port: 80,
    path: '/patients/1',
    method: 'GET'
};

//index
app.get('/', routes.index);
app.get('/index', routes.index);

request.get('http://shin-ny.herokuapp.com/patients/1', function(error, res, body){
    var parseString = require('xml2js').parseString;

    parseString(body, function (err, result) {
        console.dir("This is the results: ", result);
    });
});


//Place a phone call, and respond with TwiL.

client.makeCall({

    to: myphone, // Any number Twilio can call
    from: twilioNumber, // A number you bought from Twilio and can use for outbound communication
    url: 'shin-ny.herokuapp.com/patients/1' // A URL that produces an XML document (TwiML) which contains instructions for the call

}, function(err, responseData) {

    //executed when the call has been initiated.
    console.log(responseData.from);

});

//Loop through a list of SMS messages sent from a given number
client.listSms({
    from: myphone
}, function (err, responseData) {
    responseData.smsMessages.forEach(function(message) {
        console.log('Message sent on: '+message.dateCreated.toLocaleDateString());
        console.log(message.body);
    });
});


app.get('/call', function(req, res){
    client.makeCall({

        to: myphone, // Any number Twilio can call
        from: twilioNumber, // A number you bought from Twilio and can use for outbound communication
        url: 'shin-ny.herokuapp.com/patients/1' // A URL that produces an XML document (TwiML) which contains instructions for the call

    }, function(err, responseData) {

        //executed when the call has been initiated.
        console.log(responseData.from);

    });


    client.sendSms({

        to: myphone, // Any number Twilio can deliver to
        from: twilioNumber, // A number you bought from Twilio and can use for outbound communication
        body: '' // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            console.log(responseData.from);
            console.log(responseData.body);
        }
    });

    res.send('Here are the patient conditions: x, y ,z');
});


app.get('/signup', function(req, res){

    client.sendSms({

        to: myphone, // Any number Twilio can deliver to
        from: twilioNumber, // A number you bought from Twilio and can use for outbound communication
        body: 'You have signed up for Emergency Alert' // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            console.log(responseData.from);
            console.log(responseData.body);
        }
    });

    res.send('Here are the patient conditions: x, y ,z');
});

app.get('/test', function(req, res){

    var resp = new twilio.TwimlResponse();

    resp.say('Welcome to Twilio!');
    resp.say('Please let us know if we can help during your development.', {
        voice:'woman',
        language:'en-gb'
    });

    res.send(resp.toString());

});


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


