import {MongoClient} from "mongodb";
import {generateToken, hashPassword, verifyPassword} from "@/components/backend/password";

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
    console.log('Password:',passwd);

    let users = client.db('GirlSocial').collection('users');
    let tokens = client.db('GirlSocial').collection('tokens');
    let user = await users.findOne({
        username
    });
    console.log(user);

    if (!user) {
        await client.close();
        return null;
    }

    if (!await verifyPassword(password, user.password)) {
        await client.close();
        return ;
    }

    let token = generateToken();
    await tokens.insertOne({
        userID: user._id,
        token
    });

    console.log(token);

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

export async function getUserByToken(token: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    let tokens = client.db('GirlSocial').collection('tokens');
    let users = client.db('GirlSocial').collection('users');
    
    const tokenDoc = await tokens.findOne({ token });
    if (!tokenDoc) {
        await client.close();
        return null;
    }

    const user = await users.findOne({ _id: tokenDoc.userID });
    await client.close();
    
    if (!user) return null;
    return { username: user.username };
}
