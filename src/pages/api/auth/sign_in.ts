import {NextApiRequest, NextApiResponse} from "next";
import {loginUser} from "@/components/backend/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    let {username, password} = req.body;

    if (!username || !password) {
        res.status(400).end();
        return;
    }

    const token = await loginUser(username, password);
    if (!token) {
        res.status(401).end();
        return;
    }

    res.setHeader("Set-Cookie", `token=${token}; Secure; SameSite=Strict; HttpOnly; Path=/`);

    return res.status(204).end();
}
