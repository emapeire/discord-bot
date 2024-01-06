import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'

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

  client.once(Events.ClientReady, () => {
    console.log(`Ready! Logged in as ${client.user.tag}`)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    const command = client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      )
      await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true
      })
    }
  })

  await client.login(token)
}
