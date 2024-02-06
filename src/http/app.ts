import fastify from 'fastify'
import { createPoll } from './routes/create-poll'

const app = fastify()

app.register(createPoll)

export { app }
