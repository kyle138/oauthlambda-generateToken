'use strict';

var google = require("googleapis");
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  "662293723339-9pqrciusdj9qu7qsfnsph3ek9m696maa.apps.googleusercontent.com", // Client ID
  "uqzoMKLTnr96BNEm6Y8lsjHL", // Client Secret
  "http://hedmmysqltest.s3-website-us-east-1.amazonaws.com/oauth2cb/" // Redirect URL
);

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event,null,2)); //DEBUG
  var code = event.code;
  var idToken_email = {};
  var email = null;
  console.log("Code: "+code); //DEBUG
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log("Error getToken: "+err);
      callback(err, null);
    } else {
      console.log("Success getToken!"); //DEBUG
      // Now token contains an access_token and an optional refresh_token. Save them.
      oauth2Client.setCredentials(tokens);
      // Get email address of user attempting to login.
      plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
        if(err) {
          console.log("Error plus.people.get"+err);
          callback(err,null);
        } else {
          // people.get returns an array of emails, we want the one with type=='account'
          for(var i=0; i<response.emails.length; i++) {
            if (response.emails[i].type == 'account') {
              email = response.emails[i].value;
              break;
            }
          }
          console.log("user email: " + email); //DEBUG
          if(email.indexOf('@hartenergy.com') > -1) {
            console.log("@hartenergy.com tokens: "+JSON.stringify(tokens,null,2));
            callback(null,tokens);
          } else {
            console.log("Non @hartenergy.com email address");
            callback("Access denied. Please sign in with @hartenergy.com account",null);
          }
        }
      }); // END plus.people.get()
    }
  }); // END oauth2Client.getToken()
};
