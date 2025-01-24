import {NextApiRequest, NextApiResponse} from "next";
import {newUser, loginUser, userExists} from "@/components/backend/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    let {username, password} = req.body;

    if (!username || !password) {
        res.status(400).json({error: "Username and password are required"});
        return;
    }

    if (await userExists(username)) {
        res.status(400).json({error: "User already exists"});
        return;
    }

    const register = await newUser(username, password);

    if (!register.success) {
        res.status(400).json({error: `An error occurred: ${register}`});
        return;
    }

    res.setHeader("Set-Cookie", `token=${register.token}; Secure; SameSite=Strict; HttpOnly; Path=/`);

    return res.status(204).end();
}
