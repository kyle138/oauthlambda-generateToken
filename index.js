'use strict';

var google = require("googleapis");
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  "662293723339-9pqrciusdj9qu7qsfnsph3ek9m696maa.apps.googleusercontent.com", // Client ID
  "uqzoMKLTnr96BNEm6Y8lsjHL", // Client Secret
  "http://hedmmysqltest.s3-website-us-east-1.amazonaws.com/oauth2cb/" // Redirect URL
);

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event,null,2)); //DEBUG
  var code = event.code;
  callback(null, JSON.stringify(code,null,2));  //DEBUG
};
