import {ReactNode} from "react";
import {CssBaseline, CssVarsProvider} from "@mui/joy";
import {Inter} from "next/font/google";

const inter = Inter({subsets: ['latin']})

export default function (props: {children: ReactNode}) {

    return <CssVarsProvider defaultColorScheme={'dark'}>
        <main className={`w-2/3 m-auto ${inter.className}`}>
            <CssBaseline />
            {props.children}
        </main>
    </CssVarsProvider>

}
