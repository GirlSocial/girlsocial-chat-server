import {MongoClient} from "mongodb";
import {generateToken} from "@/components/backend/password";

export async function listSessions(token: string): Promise<{
    name: string
}[] | null> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const sessions = client.db('GirlSocial').collection('sessions');
    const sessionDoc = await sessions.findOne({ sessionToken: token });
    if (!sessionDoc) {
        await client.close();
        return null;
    }

    const allSessions = await sessions.find({ userID: sessionDoc.userID }).toArray();
    if (!allSessions) {
        await client.close();
        return null;
    }

    await client.close();
    return allSessions.map(x => {
        return {
            name: x.sessionName ?? "Unnamed Session"
        }
    });
}

export async function createSession(user: string): Promise<string | null> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get user ID by username
    const users = client.db('GirlSocial').collection('users');
    const userDoc = await users.findOne({ username: user });
    if (!userDoc) {
        await client.close();
        return null;
    }

    // Generate a new token
    const token = generateToken();

    // Insert into sessions
    const sessions = client.db('GirlSocial').collection('sessions');
    await sessions.insertOne({
        userID: userDoc._id,
        sessionToken: token
    });

    await client.close();
    // Return token
    return token;
}

export async function getUsernameFromSession(session: string): Promise<string | null> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get session
    const sessions = client.db('GirlSocial').collection('sessions');
    const sessionDoc = await sessions.findOne({sessionToken: session});
    if (!sessionDoc) {
        await client.close();
        return null;
    }

    const users = client.db('GirlSocial').collection('users');
    const userDoc = await users.findOne({_id: sessionDoc.userID});
    if (!userDoc) {
        await client.close();
        return null;
    }

    await client.close();
    return userDoc.username;
}


export async function checkSessionValid(session: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get session
    const sessions = client.db('GirlSocial').collection('sessions');
    const sessionDoc = await sessions.findOne({sessionToken: session});
    if (!sessionDoc) {
        await client.close();
        return false;
    }

    const users = client.db('GirlSocial').collection('users');
    const userDoc = await users.findOne({_id: sessionDoc.userID});
    if (!userDoc) {
        await client.close();
        return false;
    }

    await client.close();
    return true;
}


export async function invalidateSession(token: string): Promise<boolean> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const sessions = client.db('GirlSocial').collection('sessions');
    const sessionDoc = await sessions.deleteOne({ sessionToken: token });

    await client.close();
    return sessionDoc.deletedCount === 1;
}

export async function setSessionName(token: string, name: string): Promise<void> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const sessions = client.db('GirlSocial').collection('sessions');
    await sessions.updateOne({
        sessionToken: {'$eq': token}
    }, {
        $set: {
            sessionName: name
        }
    });

    await client.close();
}

export async function getSessionName(token: string): Promise<string | null> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const sessions = client.db('GirlSocial').collection('sessions');
    const sessionDoc = await sessions.findOne({ sessionToken: token });
    if (!sessionDoc) {
        await client.close();
        return null;
    }

    return sessionDoc.sessionName ?? 'Unnamed Session';
}
