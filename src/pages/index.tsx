import React, {useEffect, useState} from "react";
import Main from "@/components/frontend/Main";
import {
    Button,
    CircularProgress,
    DialogTitle,
    FormControl,
    FormLabel,
    Input,
    List,
    ListItemButton,
    Modal,
    ModalClose,
    ModalDialog,
    Stack,
    Typography
} from "@mui/joy";
import Link from "next/link";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {listChannels} from "@/components/backend/channels";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const {token} = ctx.req.cookies;

    if (!token) {
        return {
            props: {
                channels: []
            }
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
    const [channelList, setChannelList] = useState<string[]>(props.channels);

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
            .then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        setChannelList(data);
                    }).catch(x => {
                        console.error(x);
                    })
                }
            })
            .catch(x => {
                console.error(x);
            })
    }

    useEffect(() => {
        refreshStatus();
    }, []);

    const logOut = () => {
        fetch('/api/auth/sign_out')
            .then(() => refreshStatus());
    }

    const [showNewChannel, setShowNewChannel] = useState<boolean>(false);
    const [newChannelName, setNewChannelName] = useState<string>("");
    const [newChannelError, setNewChannelError] = useState<string>("");
    const [newChannelLoading, setNewChannelLoading] = useState<boolean>(false);

    const newChannel = () => {
        setShowNewChannel(true);
        setNewChannelName("");
    }

    const submitNewChannel = () => {
        setNewChannelLoading(true);
        fetch('/api/channels', {
            method: "POST",
            body: JSON.stringify({
                name: newChannelName
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(x => {
            setNewChannelLoading(false);
            if (x.ok) {
                setChannelList([...channelList, newChannelName]);
                setShowNewChannel(false);
            } else {
                x.json().then(x => {
                    setNewChannelError(`Error: ${x.error}`)
                }).catch(x => {
                    setNewChannelError(`Error: ${x.statusText} (${x.status})`)
                })
            }
        }).catch(x => {
            setNewChannelLoading(false);
            setNewChannelError(`Error: ${x}`);
        })
    }

    return (<Main>
        <Stack spacing={1}>
            <Typography level={'h1'}>GirlSocial</Typography>
            {loginStatus.startsWith('Logged in as') && (<>
                <Typography>{`You are l${loginStatus.slice(1)}`}</Typography>
                <Button onClick={logOut} color={'danger'}>Log Out</Button>
            </>)}

            {loginStatus === 'Not logged in' && (<>
                <Typography>You are not logged in</Typography>
                <Link href={'/auth/sign_in'}>
                    <Button>Log In</Button>
                </Link>
                <Link href={'/auth/register'}>
                    <Button color={'neutral'}>Sign Up</Button>
                </Link>
            </>)}

            {/*List of channels*/}
            {channelList.length > 0 && (
                <>
                    <Typography level={'h2'}>Channels</Typography>

                    <List>
                        {channelList.map((channel) => (<Link href={`/${channel}`}>
                            <ListItemButton>
                                {channel}
                            </ListItemButton>
                        </Link>))}
                    </List>
                </>
            )}

            {/*Create channel button*/}
            <Button onClick={newChannel}>New Channel</Button>

            {/*Modal for creating a channel*/}
            <Modal open={showNewChannel} onClose={() => {
                if (!newChannelLoading) setShowNewChannel(false)
            }}>
                <ModalDialog>
                    <ModalClose/>
                    <DialogTitle>Create a channel</DialogTitle>
                    <Stack spacing={1}>
                        <FormControl>
                            <FormLabel>Channel Name</FormLabel>
                            <Input type={'text'} placeholder={'general...'} value={newChannelName}
                                   onChange={x => setNewChannelName(x.currentTarget.value)}
                                   disabled={newChannelLoading}/>
                        </FormControl>
                        {newChannelLoading ?
                            <Button disabled startDecorator={<CircularProgress/>}>Creating...</Button>
                            : <Button onClick={submitNewChannel}>New Channel</Button>}
                        {newChannelError &&
                            <Typography>{`An error occured: ${newChannelError}`}</Typography>}
                    </Stack>
                </ModalDialog>
            </Modal>
        </Stack>
    </Main>);
}
