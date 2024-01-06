import { REST, Routes } from 'discord.js'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const configBuffer = readFileSync(new URL('./config.json', import.meta.url))
const config = JSON.parse(configBuffer.toString())

const { clientId, guildId, token } = config
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
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    )
  } catch (error) {
    console.error(error)
  }
})()
