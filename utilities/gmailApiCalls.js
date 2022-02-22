
const checkUnreadMessages = async (oAuthClient) => {

    const res = await oAuthClient.users.messages.list({
        userId: 'me',
        labelIds : 'UNREAD',
        q : 'has:attachment'
    });

    return ( (res.data.resultSizeEstimate>0) ? true : false );

}

const getMessages = async (oAuthClient) => {
    
    let messages = [];

    const res = await oAuthClient.users.messages.list({
        userId: 'me',
        q : 'label:unread has:attachment'
    });

    res.data.messages.forEach((item)=>{
        messages.push(item)
    });

    while(true){
        if(! res.data.nextPageToken){
            break;
        }
        let inner_res = await oAuthClient.users.messages.list({
            userId : 'me',
            q : 'label:unread has:attachment',
            pageToken : res.data.nextPageToken
        });

        inner_res.data.messages.forEach((item)=>{
            messages.push(item)
        });

    }

    return Promise.resolve(messages);

}

const getAttachments = async (oAuthClient,messages) => {

    var attachments = [];

    for(let i=0;i<messages.length;i++){
        const msg = await oAuthClient.users.messages.get({
            userId : 'me',
            id : messages[i].id
        });
        for(let j=0;j<(msg.data.payload.parts).length;j++){
            if(!(msg.data.payload.parts[j].mimeType).includes('multipart')){
                attachments.push({
                    messageId : messages[i].id,
                    attachmentId : msg.data.payload.parts[j].body.attachmentId,
                    mimeType : msg.data.payload.parts[j].mimeType,
                    fileName : msg.data.payload.parts[j].filename,
                    from : msg.data.payload.headers[16].value,
                    timeStamp : msg.data.payload.headers[17].value
                });
            }
        }
    }

    return attachments;

}

const getAttachmentData = async (oAuthClient,attachments) => {

    for(let i=0;i<attachments.length;i++){
        const attachmentData = await oAuthClient.users.messages.attachments.get({
            userId : 'me',
            messageId : attachments[i].messageId,
            id : attachments[i].attachmentId
        });
        
        attachments[i].data = attachmentData.data.data;
    }

    return attachments;

}

const removeLabel = async (oAuthClient,attachments) => {

    for(let i=0;i<attachments.length;i++){
        await oAuthClient.users.messages.modify({
            userId : 'me',
            id : attachments[i].messageId,
            requestBody : {
                removeLabelIds : [ "UNREAD" ]
            }
        });
    }

}

module.exports = { getMessages , getAttachments , getAttachmentData ,
     removeLabel , checkUnreadMessages };