const axios = require('axios');
const secretKey = require('../config/config.json');
const streamifier = require('streamifier');
​
const uploadAttachmentsDropBox = async (attachments) => {
    for(let i=0;i<attachments.length;i++){

        let date = new Date(attachments[i].timeStamp);
        let file_name = `/${attachments[i].from}/${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${attachments[i].fileName}`;
       
        const result = await axios({
            method: 'post',
            url: `https://content.dropboxapi.com/2/files/upload`,
            headers: {
                Authorization: `Bearer ${secretKey.dropBoxAccessToken}`,
                'Dropbox-API-Arg': `{"path": "${file_name}","mode": "overwrite","autorename": true,"mute": false}`,
                'Content-Type': 'application/octet-stream'
            },
            data: streamifier.createReadStream(Buffer.from(attachments[i].data,'base64')),
        });
    }
}
​
module.exports = { uploadAttachmentsDropBox };