const fs = require('fs');
const inquirer = require('inquirer');
const { google } = require('googleapis');
const clientSecretGmail = require('../config/clientSecretGmailApi.json');
const { clientSecretGmailPath } = require('../config/config.json');

const scopes_gmail = [
    'https://www.googleapis.com/auth/gmail.modify'
];

const getAuthenticationGmail = async () => {

    const oAuth2Client = getAuthClientInstance(clientSecretGmail);
    let tokens = null;

    if( !clientSecretGmail.tokens || checkTokenExpired(clientSecretGmail)){
        let refresh_token = await getRefreshToken(oAuth2Client,scopes_gmail,'Gmail');
        ({ tokens } = await oAuth2Client.getToken(refresh_token.code));
        tokens.refresh_token = refresh_token.code;
        storeData(clientSecretGmail,'tokens',tokens,clientSecretGmailPath);
    }
    else{
        tokens = clientSecretGmail.tokens;
    }

    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({
        version : 'v1',
        auth : oAuth2Client
    });

    return gmail;

}

const getAuthClientInstance = (clientSecret) => {

    const oAuth2Client = new google.auth.OAuth2(
        clientSecret.web.client_id,
        clientSecret.web.client_secret,
        clientSecret.web.redirect_uris
    );
    
    return oAuth2Client;

}

const getRefreshToken = (oAuth2Client,scopes,value) => {

    const getAuthUrl = oAuth2Client.generateAuthUrl({
        access_type : 'offline',
        scope : scopes
    });

    const question = [
        {
            type : 'input',
            name : 'code',
            message : 'Enter your refreshToken here'
        }
    ];

    console.log(`Authorize the app for ${value} by visiting this url\n`,getAuthUrl);

    let token = inquirer
        .prompt(question)
        .then(token=>token);

    return token;

}

const checkTokenExpired = (source) => {

    let currentTime = Date.now();
    let expiryTime = new Date(source.tokens.expiry_date - 600000);
    expiryTime = expiryTime.valueOf();
    return ( (currentTime < expiryTime) ? false : true );
}

const storeData = (clientSecret,Key,value,path) => {
    clientSecret[Key] = value;
    fs.writeFileSync(path,JSON.stringify(clientSecret));
}

module.exports = { getAuthenticationGmail };