import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'

const app = fastify()

app.register(cookie, {
  secret: 'secret',
  hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

export { app }
