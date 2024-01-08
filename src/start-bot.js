import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Collection, GatewayIntentBits } from 'discord.js'

import dotenv from 'dotenv'
dotenv.config()

const token = process.env.DISCORD_TOKEN

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function startBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })
  client.commands = new Collection()

  const commandCategories = readdirSync(join(__dirname, 'commands'))
  for (const category of commandCategories) {
    const commandFiles = readdirSync(
      join(__dirname, 'commands', category)
    ).filter((file) => file.endsWith('.js'))

    for (const file of commandFiles) {
      const filePath = join(__dirname, 'commands', category, file)
      try {
        const command = await import(`file://${filePath}`)
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command)
        } else {
          console.log(
            `[WARNING] The command in ${filePath} does not export the required 'data' or 'execute' properties.`
          )
        }
      } catch (error) {
        console.error(`[ERROR] Error loading command in ${filePath}:`, error)
      }
    }
  }

  const eventFiles = readdirSync(join(__dirname, 'events')).filter((file) =>
    file.endsWith('.js')
  )

  for (const file of eventFiles) {
    const filePath = join(__dirname, 'events', file)
    try {
      const event = await import(`file://${filePath}`)
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
      } else {
        client.on(event.name, (...args) => event.execute(...args))
      }
    } catch (error) {
      console.error(`[ERROR] Error loading event in ${filePath}:`, error)
    }
  }

  await client.login(token)
}
