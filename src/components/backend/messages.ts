import {MongoClient, ObjectId} from "mongodb";
import {channelExists, nameToId} from "@/components/backend/channels";
import {getUsernameFromSession} from "@/components/backend/sessions";

export async function createMessage(username: string, channel: string, message: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get author ID
    const users = client.db('GirlSocial').collection('users');
    const userDoc = await users.findOne({ username });
    if (!userDoc) {
        await client.close();
        return false;
    }

    // Check channel existence
    if (!await channelExists(channel)) return false;

    const messages = client.db('GirlSocial').collection('messages');
    const messageDoc = await messages.insertOne({
        authorID: userDoc._id,
        channelID: await nameToId(channel),
        type: 'text',
        message: message,
        createdAt: new Date(),
        attachments: [],
        reactions: []
    });

    await client.close();
    return messageDoc.insertedId.toString();
}

export async function deleteMessage(channel: string, id: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Validate ObjectID
    if (!ObjectId.isValid(id)) {
        await client.close();
        return false;
    }

    // Check the existence of the channel
    if (!await channelExists(id)) return false;

    // Delete message
    const messages = client.db('GirlSocial').collection('messages');
    await messages.deleteOne({ _id: new ObjectId(id), channelID: await nameToId(id) });

    await client.close();
    return true;
}

export async function editMessage(id: string, channel: string, message: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Check ObjectID validity
    if (!ObjectId.isValid(id)) {
        await client.close();
        return false;
    }

    if (!await channelExists(id)) return false;

    const messages = client.db('GirlSocial').collection('messages');
    const updResult = await messages.updateOne({
        _id: new ObjectId(id),
        channelID: await nameToId(channel),
    }, {
        $set: {
            message: message
        }
    });

    return updResult.modifiedCount === 1;
}

export async function listMessages(channel: string, limit: number) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Validate channel existence
    if (!await channelExists(channel)) return false;

    // Get messages for the channel
    const messages = client.db('GirlSocial').collection('messages');
    const messagesDocs = await messages.aggregate([
        {
            '$match': {
                channelID: await nameToId(channel)
            }
        },
        {
            '$orderBy': {
                createdAt: -1
            }
        },
        {
            '$limit': limit
        }
    ]).toArray();

    let userCache: {[key:string]:string} = {};

    const messagesMapped = await Promise.all(messagesDocs.map(async messageDoc => {
        // Resolve users for these messages
        let username = "";
        if (messageDoc.authorID in userCache) {
            username = userCache[messageDoc.authorID];
        } else {
            const userDoc = await client.db('GirlSocial').collection('users').findOne({ _id: messageDoc.authorID });
            if (!userDoc) {
                return null;
            }

            username = userDoc.username;
        }

        // Return a message object
        return  {
            author: username,
            message: messageDoc.message,
            type: messageDoc.type,
            createdAt: messageDoc.createdAt,
            attachments: messageDoc.attachments,
            reactions: messageDoc.reactions
        }
    }));

    // Filter messages where the author couldn't be found
    const messagesFiltered = messagesMapped.filter(x => !!x);

    await client.close();
    return messagesFiltered;
}
