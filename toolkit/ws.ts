// creating WS class
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
          const data = JSON.parse(me.data)
          const lineId = data.line[0]
          //   filter by 21, 22, 23 in slot 0
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
