import type { Client } from 'discord.js'

declare module 'discord.js' {
  export interface Client extends Client {
    commands: Collection<unknown, any>
  }

  export interface ApplicationCommandRaw extends ApplicationCommand {
    
  }
}

export interface Command {

}