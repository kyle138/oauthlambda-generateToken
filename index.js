'use strict';

var google = require("googleapis");
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

// Initialize oauth2Client using Lambda environment variables
var oauth2Client = new OAuth2(
  process.env.clientId, // Client ID
  process.env.clientSecret, // Client Secret
  process.env.redirectUrl // Redirect URL
);

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event,null,2)); //DEBUG
  if(!event.code) {
    callback("Required field missing: code");
  } else {
    var code = event.code;
  }
  var email = null;
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
            tokens.admitted=1;  //The logged in account is admitted
            tokens.email=email;
            console.log("@hartenergy.com tokens: "+JSON.stringify(tokens,null,2));
            callback(null, tokens);
          } else {
            console.log("Non @hartenergy.com email address");
            var res = {
              "admitted": 0,
              "errorMessage": "Access denied. Please log out and back in using your @hartenergy.com account."
            };
            callback(null, res);
          }
        }
      }); // END plus.people.get()
    }
  }); // END oauth2Client.getToken()
};
