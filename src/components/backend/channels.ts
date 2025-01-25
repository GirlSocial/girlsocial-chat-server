import {MongoClient, ObjectId} from "mongodb";

export async function createChannel(name: string): Promise<null | ObjectId> {

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Check if a channel with this name exists
    const channels = client.db('GirlSocial').collection('channels');
    if (await channels.findOne({name})) {
        await client.close();
        return null;
    }

    // Create the channel

    const channelDoc = await channels.insertOne({
        name: name
    })

    await client.close();
    return channelDoc.insertedId;
}

export async function nameToId(name: string): Promise<ObjectId | null> {

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get the channel
    const channels = client.db('GirlSocial').collection('channels');
    const channelDoc = await channels.findOne({name});

    await client.close();
    if (!channelDoc) {
        return null;
    }

    return channelDoc._id;
}

export async function IdToName(id: ObjectId): Promise<string | null> {

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const channels = client.db('GirlSocial').collection('channels');
    const channelDoc = await channels.findOne({_id: id});
    await client.close();

    if (!channelDoc) {
        return null;
    }

    return channelDoc.name;
}

export async function channelExists(name: string): Promise<boolean> {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const channels = client.db('GirlSocial').collection('channels');
    const channelDoc = await channels.findOne({name: name});

    await client.close();

    return !!channelDoc;
}
