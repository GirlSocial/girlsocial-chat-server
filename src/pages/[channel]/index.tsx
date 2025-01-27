import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { listMessages } from "@/components/backend/messages";
import Main from "@/components/frontend/Main";
import { Button, Input, Stack, Typography } from "@mui/joy";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const { channel } = ctx.params as { channel: string };

    const messages = await listMessages(channel, 100);

    if (!messages) {
        return {
            notFound: true
        };
    }

    return {
        props: {
            messages: messages.map(x => {
                return {
                    message: x.message,
                    author: x.author
                }
            }),
            channel
        }
    }
}

function Message(props: { user: string, msg: string }) {
    return (
        <>
            <div className={'border-2 border-white rounded-md p-2 py-1'}>
                <Typography fontWeight={'bolder'} className={'text-2xl'}>{props.user}</Typography>
                <Typography>{props.msg}</Typography>
            </div>
        </>
    )
}

export default function (props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [input, setInput] = useState("");
    const [sendError, setSendError] = useState("");

    const router = useRouter();

    const sendMessage = () => {
        fetch(`/api/${props.channel}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: input
            })
        }).then(x => {
            if (x.ok) {
                router.replace(`/${props.channel}`);
            }
            else {
                setSendError(`Error: ${x.status} ${x.statusText}`)
            }
        }).catch(x => {
            setSendError(`Error: ${x}`);
        })
    }

    return <Main>
        <Typography level={'h1'}>{props.channel}</Typography>
        <Stack spacing={1}>

            <Link href={'/'}>
                <Button variant={'outlined'}>&lt; Back</Button>
            </Link>

            {props.messages.map(msg => (
                <Message user={msg.author} msg={msg.message} />
            ))}
        </Stack>

        {/* Type a message dialog */}
        <div className="fixed bottom-1 w-2/3 my-2">
            {sendError && <Typography color="danger">{sendError}</Typography>}
            <Input
                placeholder="Type a message..."
                endDecorator={[
                    <Button variant="plain" onClick={sendMessage}>Send</Button>
                ]}
                value={input}
                onChange={x => setInput(x.currentTarget.value)}
            />
        </div>
    </Main>

}
