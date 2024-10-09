import {sendEmail as emailSender} from '../integrations/google/email';
import ReactDOMServer from 'react-dom/server';

type Recipient = string | { email: string; name?: string };

function populateTemplate(message, variables) {
    return message.replace(/\{(\w+(\.\w+)*)}/g, (match, key) => {
        const value = key.split('.').reduce((acc, part) => acc?.[part], variables);
        return value !== undefined ? value : '';
    });
}
const getTo = (recipient) => {
    console.log("email Sent to: ", Array.isArray(recipient) ? recipient : [recipient.email]);
    return ["wolfgan@gmail.com"]; //todo:da togliere

    return Array.isArray(recipient) ? recipient : [recipient.email];
}

const getMessage = (message, recipient) => {
    const content = typeof message === 'string'
        ? message
        : ReactDOMServer.renderToStaticMarkup(message);

    const variables = {
        name: recipient?.name,
    };

    return content.replaceAll(/\{(\w+(?:\.\w+)*)(?::(\w+))?}/g, (match, key) => {
        const value = key.split('.').reduce((acc, part) => acc?.[part], variables);
        return value !== undefined ? value : '';
    });
}


const sender = async (recipient, bcc, subject, message) => {
    return await emailSender({
        to: getTo(recipient),
        bcc: bcc && typeof bcc === 'string' ? [bcc] : bcc,
        subject,
        message: getMessage(message, recipient),
    });
}


const getRecipients = (to: Recipient | Recipient[]): ({ email: string; name?: string } | string[])[] => {
    const recipientsArray = Array.isArray(to) ? to : [to];

    const defaults = recipientsArray.filter(r => typeof r === 'string');
    const recipients = recipientsArray.filter(r => typeof r !== 'string');

    return defaults.length > 0 ? [defaults, ...recipients] : [...recipients];
};

export async function sendEmail({
                             to,
                             bcc,
                             subject,
                             message
                         }: {
    to: string | string[] | { email: string; name: string } | { email: string; name: string }[];
    bcc?: string | string[];
    subject: string;
    message?: string | React.ReactNode;
}) {
    const sent = [];

    for(const recipient of getRecipients(to)) {
        sent.push(await sender(recipient, bcc, subject, message));
    }

    return Promise.all(sent);
}