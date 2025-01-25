import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {listMessages} from "@/components/backend/messages";
import Main from "@/components/frontend/Main";
import {Typography} from "@mui/joy";

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
            messages,
            channel
        }
    }
}

function Message(props: {user: string, msg: string}) {
    return (
        <>
            <div className={'border-2 border-white'}>
                <Typography fontWeight={'bolder'} className={'text-2xl'}>{props.user}</Typography>
                <Typography>{props.msg}</Typography>
            </div>
        </>
    )
}

export default function (props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return <Main>
        <Typography level={'h1'}>{props.channel}</Typography>
        {props.messages.map(msg => (
            <Message user={msg.author} msg={msg.message} />
        ))}
    </Main>

}
