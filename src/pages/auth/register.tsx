import Main from "@/components/frontend/Main";
import {Button, Input, Snackbar, Stack, Typography} from "@mui/joy";
import Metadata from "@/components/frontend/Metadata";
import {useState} from "react";
import {useRouter} from "next/router";

export default function () {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const router = useRouter();

    const register = () => {
        setError("");
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        fetch('/api/auth/register', {
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
        <Metadata title={'Register'} description={'Register on GirlSocial'}/>
        <Stack spacing={1}>
            <Typography level={'h1'} textAlign={'center'}>Register</Typography>

            <Typography>Username</Typography>
            <Input type={'text'} placeholder={'Username'} value={username} onChange={x => setUsername(x.currentTarget.value)}></Input>
            <Typography>Password</Typography>
            <Input type={'password'} placeholder={'Password'} onChange={x => setPassword(x.currentTarget.value)}
                   value={password}></Input>
            <Input type={'password'} placeholder={'Confirm Password'}
                   onChange={x => setConfirmPassword(x.currentTarget.value)} value={confirmPassword}></Input>
            <br/>
            <Button variant={'solid'} onClick={register}>Register</Button>

            <Snackbar open={error !== ''} variant={'solid'} color={'danger'} autoHideDuration={1000}
                      endDecorator={<Button variant={'plain'} color={'danger'} onClick={() => setError('')}>Hide</Button>}>{error}</Snackbar>
        </Stack>
    </Main>)
}
