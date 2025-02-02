import { MongoClient, ObjectId } from "mongodb";
import { channelExists, nameToId } from "@/components/backend/channels";
import { getUsernameFromSession } from "@/components/backend/sessions";

export async function createMessage(username: string, channel: string, message: string, replyTo?: ObjectId) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // If replyTo isn't null, verify such message exists
    if (replyTo) {
        const messages = client.db('GirlSocial').collection('messages');
        const replyToDoc = await messages.findOne({ _id: replyTo });
        if (!replyToDoc) {
            await client.close();
            return false;
        }
    }

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
        reactions: [],
        replyTo
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
            '$sort': {
                createdAt: 1
            }
        },
        {
            '$limit': limit
        }
    ]).toArray();

    let userCache: { [key: string]: string } = {};

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

        // Fetch replyTo information
        if (messageDoc.replyTo) {
            const replyToDoc = await client.db('GirlSocial').collection('messages').findOne({ _id: messageDoc.replyTo });
            if (!replyToDoc) {
                return null;
            }

            const replyUserDoc = await client.db('GirlSocial').collection('users').findOne({ _id: replyToDoc.authorID });
            if (!replyUserDoc) {
                return null;
            }

            messageDoc.replyTo = {
                id: replyToDoc._id.toString(),
                message: replyToDoc.message,
                author: replyUserDoc.username
            }
        }

        // Return a message object
        return {
            id: messageDoc._id.toString(),
            author: username,
            message: messageDoc.message,
            type: messageDoc.type,
            createdAt: messageDoc.createdAt,
            attachments: messageDoc.attachments,
            reactions: messageDoc.reactions,
            replyTo: messageDoc.replyTo
        }
    }));

    // Filter messages where the author couldn't be found
    const messagesFiltered = messagesMapped.filter(x => !!x);

    await client.close();
    return messagesFiltered;
}
