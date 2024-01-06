import { startBot } from './start-bot.js'
import { deployCommands } from './deploy-commands.js'

;(async () => {
  await startBot()
  deployCommands()
})()
