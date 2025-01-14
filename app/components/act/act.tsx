import { useEffect } from 'react'
import WS from "../../../toolkit/ws"


export const ActComponent = () => {
    useEffect(() => {
        const ws = new WS()

        ws.connect()

        return () => {
            ws.close()
        }
    }, [])

    return (
        <h1>yes</h1>
    )
}