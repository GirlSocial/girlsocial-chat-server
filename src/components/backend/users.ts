import {MongoClient} from "mongodb";
import {hashPassword, verifyPassword} from "@/components/backend/password";
import {createSession} from "@/components/backend/sessions";

export async function newUser(username: string, password: string): Promise<{
    success: false;
} | {
    success: true;
    token: string;
}> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Check if the user exists
    let users = client.db('GirlSocial').collection('users');
    if (await users.countDocuments({'username': {'$eq': username}}) > 0) {
        await client.close();
        return {success: false};
    }

    // Hash password
    let passwd = await hashPassword(password);

    // Insert user
    await users.insertOne({
        username: username,
        password: passwd
    });

    await client.close();

    // Create session for new user
    const session = await createSession(username);

    if (!session) {
        return {success: false};
    }

    return {
        success: true,
        token: session
    };
}

export async function loginUser(username: string, password: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    let passwd = await hashPassword(password);

    let users = client.db('GirlSocial').collection('users');
    let user = await users.findOne({
        username
    });

    if (!user) {
        await client.close();
        return null;
    }

    if (!await verifyPassword(password, user.password)) {
        await client.close();
        return null;
    }

    let token = await createSession(username);
    if (!token) {
        await client.close();
        return null;
    }

    await client.close();
    return token;
}

export async function userExists(username: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    let users = client.db('GirlSocial').collection('users');
    const exists = !!(await users.findOne({'username': {'$eq': username}}));
    await client.close();
    return exists;
}

