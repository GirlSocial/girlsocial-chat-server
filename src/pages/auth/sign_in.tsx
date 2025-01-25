
import Main from "@/components/frontend/Main";
import {Button, Input, Snackbar, Stack, Typography} from "@mui/joy";
import Metadata from "@/components/frontend/Metadata";
import {useState} from "react";
import {useRouter} from "next/router";

export default function () {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const signIn = () => {
        setError("");

        fetch('/api/auth/sign_in', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(x => {
            if (!x.ok) {
                x.json().then(y => {
                    setError(`Error: ${x.statusText}: ${y.error}`);
                }).catch(y => {
                    setError(`Error: ${x.statusText}: ${y}`);
                })
            }
            else {
                router.push("/");
            }
        }).catch(x => {
            setError(`Error: ${x}`);
        })
    }

    return (<Main>
        <Metadata title={'Sign In'} description={'Sign in to GirlSocial'}/>
        <Stack spacing={1}>
            <Typography level={'h1'} textAlign={'center'}>Sign In</Typography>

            <Typography>Username</Typography>
            <Input type={'text'} placeholder={'Username'} value={username} onChange={x => setUsername(x.currentTarget.value)}></Input>
            <Typography>Password</Typography>
            <Input type={'password'} placeholder={'Password'} onChange={x => setPassword(x.currentTarget.value)}
                   value={password}></Input>
            <br/>
            <Button variant={'solid'} onClick={signIn}>Sign In</Button>

            <Snackbar open={error !== ''} variant={'solid'} color={'danger'} autoHideDuration={1000}
                      endDecorator={<Button variant={'plain'} color={'danger'} onClick={() => setError('')}>Hide</Button>}>{error}</Snackbar>
        </Stack>
    </Main>)
}
