import { useEffect, useState } from "react";
import Main from "@/components/frontend/Main";
import { Button, List, ListItem, ListItemButton, Stack, Typography } from "@mui/joy";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { listChannels } from "@/components/backend/channels";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const { token } = ctx.req.cookies;

    if (!token) {
        return {
            props: {}
        }
    }

    const channels = await listChannels();

    return {
        props: {
            channels
        }
    }
}

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [loginStatus, setLoginStatus] = useState<string>("Loading...");

    // Channels
    const [channelList, setChannelList] = useState<string[]>([]);

    const refreshStatus = () => {
        fetch('/api/auth/status')
            .then(res => res.json())
            .then(data => {
                if (data.username) {
                    setLoginStatus(`Logged in as ${data.username}`);
                } else {
                    setLoginStatus("Not logged in");

                }
            })
            .catch(() => setLoginStatus("Not logged in"));

        fetch('/api/channels')
            .then(res => res.json())
            .then(data => setChannelList(data));
    }

    useEffect(() => {
        refreshStatus();
    }, []);

    const logOut = () => {
        fetch('/api/auth/sign_out')
            .then(() => refreshStatus());
    }

    return (<Main>
        <Stack spacing={1}>
            <Typography level={'h1'}>GirlSocial</Typography>
            {loginStatus.startsWith('Logged in as') && (
                <>
                    <Typography>{`You are l${loginStatus.slice(1)}`}</Typography>
                    <Button onClick={logOut} color={'danger'}>Log Out</Button>
                </>
            )}
            {loginStatus === 'Not logged in' && (
                <>
                    <Typography>You are not logged in</Typography>
                    <Link href={'/auth/sign_in'}>
                        <Button>Log In</Button>
                    </Link>
                    <Link href={'/auth/register'}>
                        <Button color={'neutral'}>Sign Up</Button>
                    </Link>
                </>
            )}
            {props.channels && <>
                <Typography level={'h2'}>Channels</Typography>
                {props.channels?.length === 0 && <Typography>Empty...</Typography>}
                <List>
                    {props.channels?.map((channel, index) => (
                        <Link href={`/${channel}`}>
                            <ListItemButton>
                                {channel}
                            </ListItemButton>
                        </Link>
                    ))}
                </List>
            </>}
        </Stack>
    </Main>);
}
