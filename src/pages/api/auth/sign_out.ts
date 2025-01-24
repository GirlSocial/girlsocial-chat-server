import {NextApiRequest, NextApiResponse} from 'next';
import {getUsernameFromSession, invalidateSession} from "@/components/backend/sessions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).end();
        return;
    }

    const token = req.cookies.token;
    if (!token) {
        res.status(401).end();
        return;
    }

    const success = await invalidateSession(token);

    if (!success) {
        res.status(400).end();
        return;
    }

    res.setHeader("Set-Cookie", "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly");
    res.status(204).end();
}