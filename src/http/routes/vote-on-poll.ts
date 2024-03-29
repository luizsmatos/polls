import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import z from 'zod'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'
import { pubSub } from '../../utils/pub-sub'

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollParamsSchema = z.object({
      pollId: z.string(),
    })

    const voteOnPollBodySchema = z.object({
      pollOptionId: z.string(),
    })

    const { pollId } = voteOnPollParamsSchema.parse(request.params)
    const { pollOptionId } = voteOnPollBodySchema.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      })

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        })

        const previousPollOptionId = userPreviousVoteOnPoll.pollOptionId
        const votes = await redis.zincrby(
          `poll:${pollId}`,
          -1,
          previousPollOptionId,
        )

        pubSub.publish(pollId, {
          pollOptionId,
          votes: parseInt(votes, 10),
        })
      } else if (userPreviousVoteOnPoll) {
        return reply.status(400).send({
          error: 'You have already voted in this poll',
        })
      }
    } else {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 Days
        signed: true,
        httpOnly: true,
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    })

    const votes = await redis.zincrby(`poll:${pollId}`, 1, pollOptionId)

    pubSub.publish(pollId, {
      pollOptionId,
      votes: parseInt(votes, 10),
    })

    return reply.status(201).send()
  })
}
