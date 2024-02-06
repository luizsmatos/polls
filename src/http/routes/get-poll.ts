import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../../lib/prisma'

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const getPollParamsSchema = z.object({
      pollId: z.string().uuid(),
    })

    const { pollId } = getPollParamsSchema.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!poll) {
      return reply.status(404).send({
        error: 'Poll not found',
      })
    }

    return reply.status(200).send({
      poll,
    })
  })
}
