import { useEffect } from 'react'
import WS from "../../../toolkit/ws"


export const ActComponent = () => {
    useEffect(() => {
        const ws = new WS()

        ws.connect("ws://127.0.0.1:10501/ws")

        return () => {
            ws.close()
        }
    }, [])

    return (
        <h1>yes</h1>
    )
}