import fastify from 'fastify'
import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'

import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import { pollResults } from './ws/ poll-results'

const app = fastify()

app.register(cookie, {
  secret: 'secret',
  hook: 'onRequest',
})

app.register(websocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
app.register(pollResults)

export { app }
