import {MongoClient} from "mongodb";
import {generateToken, hashPassword} from "@/components/backend/password";

export async function newUser(username: string, password: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    let passwd = await hashPassword(password);

    let users = client.db('GirlSocial').collection('users');
    if (await users.countDocuments({'username': {'$eq': username}}) > 0) {
        await client.close();
        return 'Account already exists.';
    }

    await users.insertOne({
        username: username,
        password: passwd
    });

    await client.close();
    return 'Account created successfully.';
}

export async function loginUser(username: string, password: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    let passwd = await hashPassword(password);

    let users = client.db('GirlSocial').collection('users');
    let tokens = client.db('GirlSocial').collection('tokens');
    let user = await users.findOne({
        username,
        password: passwd
    });

    if (!user) {
        await client.close();
        return null;
    }

    let token = generateToken();
    await tokens.insertOne({
        userID: user._id,
        token
    });

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
