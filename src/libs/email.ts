import {sendEmail as emailSender} from '../integrations/google/email';
import ReactDOMServer from 'react-dom/server';

type Recipient = { email: string; name?: string };
type RawRecipient = string | Recipient;
type EmailContent = string | React.ReactNode;


function normalizeRecipients(to: RawRecipient | RawRecipient[]): Recipient[] {
    const recipients = Array.isArray(to) ? to : [to];

    return recipients.map(r =>
        typeof r === 'string' ? { email: r, name: undefined } : r
    );
}

function normalizeEmails(input?: string | string[]): string[] {
    if (!input) return [];
    return Array.isArray(input) ? input : [input];
}


function renderMessage(content: EmailContent, recipient: Recipient): string {
    const raw = typeof content === 'string'
        ? content
        : ReactDOMServer.renderToStaticMarkup(content);

    const variables = { name: recipient.name };

    return raw.replaceAll(/\{(\w+(?:\.\w+)*)}/g, (_, key) => {
        const value = key.split('.').reduce((acc: any, part: string) => acc?.[part], variables);
        return value !== undefined ? String(value) : '';
    });
}

async function sender(
    recipient: Recipient,
    bcc: string[],
    subject: string,
    message?: EmailContent
) {
    return emailSender({
        to: [recipient.email],
        bcc,
        subject,
        message: message ? renderMessage(message, recipient) : '',
    });
}


export async function sendEmail({
                                    to,
                                    bcc,
                                    subject,
                                    message,
                                }: {
    to: string | string[] | Recipient | Recipient[];
    bcc?: string | string[];
    subject: string;
    message?: EmailContent;
}) {
    const recipients = normalizeRecipients(to);
    const bccArray = normalizeEmails(bcc);

    return Promise.all(
        recipients.map(recipient =>
            sender(recipient, bccArray, subject, message)
        )
    );
}