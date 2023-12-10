const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Your configuration values
const CLIENT_ID="your client id"
const CLIENT_SECRET='your client secret'
const REFRESH_TOKEN = "your refresh token";
const EMAIL = 'Your email address used in the OAuth client ID';


async function setTransport() {
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      accessToken,
    },
  });

  return transporter;
}

async function sendMail() {
  const transporter = await setTransport();

  // Read the Handlebars template
  const templatePath = path.join(__dirname, 'template', 'welcome.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  const mailOptions = {
    from: 'example@gmail.com',
    to: 'example@gmail.com',
    subject: 'Welcome to Our Platform',
    html: template({ name: 'Francis' }), // Pass dynamic data to the template
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendMail();
