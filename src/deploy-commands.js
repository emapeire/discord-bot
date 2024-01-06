import { REST, Routes } from 'discord.js'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
dotenv.config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function deployCommands() {
  const commands = []
  const commandFiles = readdirSync(join(__dirname, 'commands/utility')).filter(
    (file) => file.endsWith('.js')
  )

  for (const file of commandFiles) {
    const filePath = join(__dirname, 'commands/utility', file)
    const commandModule = await import(`file://${filePath}`)
    if (commandModule.data) {
      commands.push(commandModule.data.toJSON())
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing the 'data' property.`
      )
    }
  }

  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands
    })

    console.log(
      `Successfully reloaded ${data.length} application (/) commands globally.`
    )
  } catch (error) {
    console.error(error)
  }
}
