const { getAuthenticationGmail } = require('./utilities/authentication.js');
const { getMessages , getAttachments , getAttachmentData 
    , removeLabel , checkUnreadMessages } = require('./utilities/gmailApiCalls.js');
const interval = require('interval-promise');
const clientSecret = require('./config/clientSecretGmailApi.js 5 * 60 *on');

const intervaltime = 5 * 60 * 1000;

async function main(){

    try{
        let oAuthClientGmail = await getAuthenticationGmail();
        
        if (await checkUnreadMessages(oAuthClientGmail)){

            let messages = await getMessages(oAuthClientGmail);
            console.log('Fetched Unread Messages...');
            
            let attachments = await getAttachments(oAuthClientGmail,messages);
            console.log('Fetched attachments From Unread Messages...');


            let attachmentsWithData = await getAttachmentData(oAuthClientGmail,attachments);
            console.log('Uploading Attachments...');

            // Upload to DropBox
            await uploadAttachmentsDropBox(attachmentsWithData);
            console.log('Files Uploaded to Drop Box');

            await removeLabel(oAuthClientGmail,attachments);
            console.log('Mail Labels Updated...');

        }else{
            console.log('No new Messages');
        }

    }catch(err){
        console.log(err);
        if(!err instanceof Error){
            clientSecret.tokens = '';
        }
    }

}

interval(async ()=>{
    await main();
},intervaltime);