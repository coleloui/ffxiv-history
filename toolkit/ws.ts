// creating WS class

import { setObjValue } from './utils'
class WS {
  // Set Types
  ws: WebSocket | undefined
  events: object
  ready: boolean
  url: string
  settings: {
    reconnect: {
      interval: number
    }
  }

  // WS constructor
  constructor() {
    this.ws = undefined
    this.events = {}
    this.ready = false
    this.url = 'ws://127.0.0.1:10501/ws'
    this.settings = {
      reconnect: {
        interval: 5 * 1000,
      },
    }

    return this
  }

  // connection function
  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.addEventListener('error', (err) => {
        throw err
      })

      this.ws.addEventListener('open', async () => {
        console.log('Socket opened')

        this.ready = true

        this.ws?.send(
          JSON.stringify({
            call: 'subscribe',
            events: ['LogLine'],
          })
        )

        this.ws?.addEventListener('message', (me) => {
          const useableLines = [20, 21, 22, 23, 25]
          const data = JSON.parse(me.data)
          const lineId = parseInt(data.line[0])
          const lineCaster = data.line[3]
          const lineData = data.line
          if (useableLines.includes(lineId) === false) {
            return false
          } else if (lineCaster !== 'Wagyu Tallow') {
            return false
          } else {
            const rowData = {}
            if (lineId === 20) {
              setObjValue(rowData, 'cast time', lineData[8])
            }
            setObjValue(rowData, 'target', lineData[7])
            setObjValue(rowData, 'spell id', lineData[4])
            console.log('linedata', lineData)
            // console.log('rowdata', rowData)
          }
        })
      })

      this.ws?.addEventListener('close', async () => {
        console.log('Socket closed')

        this.ws?.close()
        this.ws = undefined

        setTimeout(() => {
          this.connect()
        }, this.settings.reconnect.interval)
      })
    } catch (err) {
      console.error(err)
      return false
    }
  }

  close() {
    this.ws?.close()
    this.ws = undefined
  }
}

export default WS
