import { REST, Routes } from 'discord.js'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const serverId = process.env.DISCORD_SERVER_ID

const __dirname = dirname(fileURLToPath(import.meta.url))
const commands = []
const foldersPath = join(__dirname, 'commands')
const commandFolders = readdirSync(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder)
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith('.js')
  )
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file)
    const command = await import(`file://${filePath}`)
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON())
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

const rest = new REST().setToken(token)

;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    )

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, serverId),
      { body: commands }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    )
  } catch (error) {
    console.error(error)
  }
})()
