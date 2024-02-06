import { app } from './app'

const bootstrap = async () => {
  try {
    await app.listen({ port: 3333 })
    console.log('Server is running 🚀')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

bootstrap()
