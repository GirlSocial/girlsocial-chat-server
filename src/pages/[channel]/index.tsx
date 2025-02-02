import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { listMessages } from "@/components/backend/messages";
import Main from "@/components/frontend/Main";
import { Button, Dropdown, Input, Menu, MenuItem, MenuList, Modal, ModalClose, ModalDialog, Stack, Typography } from "@mui/joy";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ObjectId, WithId } from "mongodb";
import { Popper } from '@mui/base/Popper'
import { ClickAwayListener } from "@mui/base";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

    const { channel } = ctx.params as { channel: string };

    let messages = await listMessages(channel, 100);

    if (!messages) {
        return {
            notFound: true
        };
    }

    return {
        props: {
            messages: messages.map(x => {
                return {
                    id: x.id,
                    message: x.message,
                    author: x.author,
                    replyTo: !!x.replyTo ? x.replyTo : null,
                    createdAt: x.createdAt.toISOString()
                }
            }),
            channel
        }
    }
}

function Message(props: { user: string, msg: string, replyTo?: any, createdAt?: string, onReply: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);
    function reply() {
        props.onReply();
        setMenuOpen(false);
    }

    return (
        <>
            <Dropdown open={menuOpen} onOpenChange={(_, x) => setMenuOpen(x)}>
                <div className={'border-2 border-white rounded-md p-2 py-1'} onClick={() => setMenuOpen(!menuOpen)} ref={divRef}>
                    {props.replyTo && <Typography fontSize={'small'}>{`Replying to ${props.replyTo.author}: ${props.replyTo.message}`}</Typography>}
                    <Stack direction="row" alignItems={'center'}>
                        <Typography fontWeight={'bolder'} className={'text-2xl'}>{props.user}</Typography>
                        {props.createdAt && <Typography fontSize={'small'} marginLeft={'1rem'}>{props.createdAt}</Typography>}
                    </Stack>
                    <Typography>{props.msg}</Typography>
                </div>
                <Menu>
                    <MenuItem onClick={props.onReply}>Reply...</MenuItem>
                </Menu>
            </Dropdown>
            <Popper anchorEl={divRef.current} open={menuOpen} role={undefined} disablePortal modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}>
                <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                    <MenuList>
                        <MenuItem onClick={reply}>Reply...</MenuItem>
                    </MenuList>
                </ClickAwayListener>
            </Popper>
        </>
    )
}

export default function (props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [messages, setMessages] = useState<{
        id: string;
        message: string;
        author: string;
        createdAt: string;
        replyTo: string | null;
        formattedCreatedAt?: string;
    }[]>(props.messages);

    const [input, setInput] = useState("");
    const [sendError, setSendError] = useState("");
    const [sending, setSending] = useState(false);

    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const replyingToUser = props.messages.find(x => x.id === replyingTo)?.author ?? "someone...";

    const router = useRouter();

    const hasLoaded = useRef(false);

    useEffect(() => {
        window.scroll(0, window.outerHeight);

        if (!hasLoaded.current) {
            hasLoaded.current = true;
            setMessages(
                messages.map(x => {
                    return {
                        ...x,
                        formattedCreatedAt: x.formattedCreatedAt ?? new Date(x.createdAt).toLocaleString()
                    }
                })
            )
            return;
        }
    }, []);

    const sendMessage = () => {
        setSending(true);
        fetch(`/api/${props.channel}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: input,
                replyingTo: replyingTo
            })
        }).then(x => {
            setSending(false);
            if (x.ok) {
                setInput("");
                setReplyingTo(null);
                router.replace(`/${props.channel}`).then(() =>
                    window.scroll(0, window.outerHeight));
            }
            else {
                setSendError(`Error: ${x.status} ${x.statusText}`)
            }
        }).catch(x => {
            setSending(false);
            setSendError(`Error: ${x}`);
        })
    }

    return <Main>
        <Typography level={'h1'}>{props.channel}</Typography>
        <Stack spacing={1}>

            <Link href={'/'}>
                <Button variant={'outlined'}>&lt; Back</Button>
            </Link>

            {messages.map(msg => {
                function replyToMessage() {
                    setReplyingTo(msg.id);
                }

                return (
                    <Message replyTo={msg.replyTo} createdAt={msg.formattedCreatedAt} user={msg.author} msg={msg.message} onReply={replyToMessage} />
                )
            })}
        </Stack>

        <br />
        <br />
        <br />

        {/* Type a message dialog */}
        <div className="fixed bottom-1 w-2/3 my-2">
            {sendError && <Typography color="danger">{sendError}</Typography>}
            {replyingTo && <Typography>Replying to {replyingToUser}</Typography>}
            <Input
                placeholder="Type a message..."
                endDecorator={[
                    <Button variant="plain" disabled={sending} onClick={sendMessage}>Send</Button>
                ]}
                value={input}
                onKeyDown={x => {
                    if (x.key === "Enter") {
                        sendMessage();
                    }
                }}
                disabled={sending}
                onChange={x => setInput(x.currentTarget.value)}
            />
        </div>
    </Main>

}
