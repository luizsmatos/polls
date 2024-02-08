type Message = { pollOptionId: string; votes: number }
type Subscriber = (message: Message) => void

export class PubSub {
  private channels: Record<string, Subscriber[]> = {}

  subscribe(channel: string, subscriber: Subscriber) {
    if (!this.channels[channel]) {
      this.channels[channel] = []
    }

    this.channels[channel].push(subscriber)
  }

  publish(channel: string, message: Message) {
    if (!this.channels[channel]) {
      return
    }

    this.channels[channel].forEach((subscriber) => {
      subscriber(message)
    })
  }
}

export const pubSub = new PubSub()
