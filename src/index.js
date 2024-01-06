import { startBot } from './start-bot.js'
import { deployCommands } from './deploy-commands.js'

async function initializeBot() {
  await startBot()
  await deployCommands()
}

initializeBot()
