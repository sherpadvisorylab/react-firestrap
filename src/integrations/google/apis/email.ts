import { google } from 'googleapis';
import { Buffer } from 'buffer';

// Funzione per inviare email tramite l'API di Gmail usando un Service Account
export async function sendEmail({ to, subject, message }) {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PATH,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    // Impersona un utente (ad esempio, un amministratore del dominio Gmail)
    const client = await auth.getClient();
    const gmail = google.gmail({ version: 'v1', auth: client });

    const email = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        message,
    ].join('\n');

    const base64EncodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: base64EncodedEmail,
        },
    });

    console.log('Email sent:', res.data);
    return res.data;
}