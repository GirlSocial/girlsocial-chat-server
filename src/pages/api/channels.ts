import {NextApiRequest, NextApiResponse} from "next";
import {createChannel, listChannels} from "@/components/backend/channels";
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
    } else if (req.method === 'POST') {
        // Create a channel with name

        if (req.headers["content-type"] !== "application/json") {
            res.status(400).json({'error': 'Invalid content-type'});
            return;
        }

        const { name } = req.body;
        if (!name || name.length < 2) {
            res.status(400).json({'error': 'Name was not specified/was empty'});
            return;
        }

        const createChannelResult = await createChannel(name);
        if (createChannelResult) {
            res.status(200).json({'channel_id': createChannelResult.toString()});
        } else {
            res.status(400).json({'error': 'Channel failed to create'});
        }
    }

    // TODO: Implement POST, DELETE, PATCH

}