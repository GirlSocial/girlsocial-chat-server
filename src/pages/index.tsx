import {useEffect, useState} from "react";
import Main from "@/components/frontend/Main";
import {Button, Stack, Typography} from "@mui/joy";
import Link from "next/link";
import {useRouter} from "next/router";

export default function Home() {
    const [loginStatus, setLoginStatus] = useState<string>("Loading...");

    const router = useRouter();

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
                <Typography>To be done...</Typography>
            </Stack>
        </Main>);
}
