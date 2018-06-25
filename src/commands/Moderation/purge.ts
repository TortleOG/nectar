import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';
import { Message } from 'discord.js';

import { NectarClient } from '../../../lib/Client';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 2,
      requiredPermissions: ['MANAGE_MESSAGES'],
      description: 'Deletes X amount of messages from a channel, or from Y user.',
      usage: '[user:user] <amount:int>',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]): Promise<KlasaMessage | KlasaMessage[]> {
    if (!amount && !user) throw `❌ | ${msg.author}, you must specify a user and an amount, or just an amount, of messages to purge.`;

    let messages = await msg.channel.messages.fetch({ limit: amount });
    let filterMes: Message[];
    if (user) {
      filterMes = messages.filter(mes => mes.author.id === user.id).array().slice(0, amount);
    }

    try {
      await msg.channel.bulkDelete(filterMes);
      return msg.send(`🗑 | Deleted ${user ? `**${amount} messages** from user **${user.tag}**` : `**${amount} messages**`}.`);
    } catch (err) {
      this.client.console.error(err);
      return msg.send(`It seems an error has occured!\n\`\`\`${err}\`\`\``);
    }
  }
}
