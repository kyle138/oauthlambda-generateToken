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
  }
  var code = event.code;

  // Get the primary account 'user@domain.com' of the Oauth2 authenticated account
  function getPrimaryAccount(emails, cb) {
    if(!emails) {
      if(typeof cb === 'function' && cb("Error: emails is a required argument", null));
      return false;
    } else {
      var ret = false;
      // plus.people.get returns an array of emails, we want the one with type=='account'
      for(var i=0; i<emails.length; i++) {
        if (emails[i].type == 'account') {
          ret = emails[i].value;
        }
      }; // End for
      if(ret) {
        if(typeof cb === 'function' && cb(null, ret));
        return ret;
      } else {
        if(typeof cb === 'function' && cb("Error: No primary account found", null));
        return ret;
      } // End if ret
    } // End if !emails
  }; // End getAccount()

  // Check if account is within the specified domain
  function accountInDomain(account, domain, cb) {
    if(!account || !domain) {
      if(typeof cb === 'function' && cb("Error: 'account' and 'domain' are required arguments", null));
      return false;
    } else {
      if(account.indexOf(domain) > -1) {
        if(typeof cb === 'function' && cb(null, true));
        return true;
      } else {
        if(typeof cb === 'function' && cb(null, false));
        return false;
      }
    } // End if !account || !domain
  }; // End inDomain()

  // Swap google code for google token
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log("Error getToken: "+err);
      callback(err, null);
    } else {
      console.log("Success getToken!"); //DEBUG
      // Now token contains an access_token and an optional refresh_token. Save them.
      oauth2Client.setCredentials(tokens);
      // Get email addresses of user attempting to login.
      plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
        if(err) {
          console.log("Error plus.people.get"+err);
          callback(err,null);
        } else {
          getPrimaryAccount(response.emails, function(err, account){
            if(err) {
              console.log("Error getAccount: "+err);
              callback(err,null);
            } else {
              // In this case we only want to return tokens for users logged in with @hartenergy.com google accounts
              accountInDomain(account, '@hartenergy.com', function(err, res) {
                if(err) {
                  console.log("Error accountInDomain: "+err);
                  callback(err,null);
                } else {
                  if(res) {
                    tokens.admitted=1;  //The logged in account is admitted
                    tokens.email=email;
                    console.log("Login admitted: "+email);
                    callback(null, tokens);
                  } else {
                    console.log("Non @hartenergy.com email address");
                    var ret = {
                      "admitted": 0,
                      "errorMessage": "Access denied. Please log out of your Google account in this browser and log back in using your @hartenergy.com account."
                    };
                    callback(null, ret);
                  } // END if(@hartenergy.com)
                }
              }); // End accountInDomain
            }
          }); // End getPrimaryAccount
        }
      }); // END plus.people.get()
    }
  }); // END oauth2Client.getToken()
};  // END exports.handler
