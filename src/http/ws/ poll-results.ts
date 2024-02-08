import { FastifyInstance } from 'fastify'
import z from 'zod'
import { pubSub } from '../../utils/pub-sub'

export async function pollResults(app: FastifyInstance) {
  app.get(
    '/polls/:pollId/results',
    { websocket: true },
    async (connection, request) => {
      const getPollParamsSchema = z.object({
        pollId: z.string().uuid(),
      })

      const { pollId } = getPollParamsSchema.parse(request.params)

      pubSub.subscribe(pollId, (message) => {
        connection.socket.send(JSON.stringify(message))
      })
    },
  )
}
