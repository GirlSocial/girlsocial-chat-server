import {NextApiRequest, NextApiResponse} from "next";
import {createMessage} from "@/components/backend/messages";
import {checkSessionValid, getUsernameFromSession} from "@/components/backend/sessions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { channel } = req.query as { channel: string };

    const token = req.cookies.token;
    if (!token) {
        res.status(401).end();
        return;
    }

    const success = await getUsernameFromSession(token);
    if (!success) {
        res.status(400).end();
        return;
    }

    if (req.method === 'POST') {
        const { message } = req.body;
        if (!message) {
            res.status(400).send({error: 'Missing parameters'});
            return;
        }

        const msg = await createMessage(success, channel, message);
        res.status(200).send({'message': msg});
    }
}
