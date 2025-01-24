import {NextApiRequest, NextApiResponse} from 'next';
import {getUsernameFromSession} from "@/components/backend/sessions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).end();
        return;
    }

    const token = req.cookies.token;
    if (!token) {
        res.status(200).json({username: null});
        return;
    }

    const payload = await getUsernameFromSession(token);
    if (!payload) {
        res.status(200).json({username: null});
        return;
    }
    res.status(200).json({username: payload});
}