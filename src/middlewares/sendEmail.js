const sendGridMail = require('@sendgrid/mail')
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);


 const sendEmail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        sendGridMail.send(mailOptions, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });
    });
}

module.exports = {sendEmail}

