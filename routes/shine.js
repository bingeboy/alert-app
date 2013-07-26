var needle = require('needle');

exports.patientInfo = needle.get('shin-ny.herokuapp.com/patients/1', function(error, response, body){
    console.log("data: " + response);
    res.send('Hello World', response);
});
