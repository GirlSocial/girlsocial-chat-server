import {NextApiRequest, NextApiResponse} from "next";
import {listChannels} from "@/components/backend/channels";
import {checkSessionValid} from "@/components/backend/sessions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const token = req.cookies.token;
    if (!token) {
        res.status(401).end();
        return;
    }

    const success = await checkSessionValid(token);
    if (!success) {
        res.status(400).end();
        return;
    }

    if (req.method === 'GET') {
        const channelList = await listChannels();
        res.status(200).json(channelList);
    }

    // TODO: Implement POST, DELETE, PATCH

}