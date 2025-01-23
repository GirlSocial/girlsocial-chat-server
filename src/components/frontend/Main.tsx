import {ReactNode} from "react";
import {CssBaseline, CssVarsProvider} from "@mui/joy";

export default function (props: {children: ReactNode}) {

    return <CssVarsProvider defaultColorScheme={'dark'}>
        <main className={'w-2/3 m-auto'}>
            <CssBaseline />
            {props.children}
        </main>
    </CssVarsProvider>

}
