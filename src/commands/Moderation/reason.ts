import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaTextChannel } from 'klasa';
import { Message, MessageEmbed } from 'discord.js';

import { NectarClient } from '../../../lib/Client';
import { ModLog } from '../../../lib/moderation/ModLog';
import { RowModLog, ModLogData, NectarConfiguration } from '../../../types/nectar_types';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 2,
      requiredPermissions: ['MANAGE_MESSAGES'],
      description: 'Changes the reason for a given modlog case.',
      usage: '<case:int|latest> <reason:str> [...]',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [selected, ...strs]: [number | string, string]): Promise<KlasaMessage | KlasaMessage[]> {
    const reason: string = strs.join(' ');

    const row: RowModLog = await this.provider.get('modlogs', msg.guild.id) as RowModLog;
    const log: ModLogData = row.modlogs[selected === 'latest' ? row.modlogs.length - 1 : (selected as number) - 1];
    if (!log) throw `❌ | ${msg.author}, there are no modlogs with that case number.`;

    const channel: KlasaTextChannel = msg.guild.channels.get((msg.guild.configs as NectarConfiguration).mod.modlog) as KlasaTextChannel;
    if (!channel) throw `❌ | I could not find a 'modlog' channel. Was it deleted?`;

    const messages = await channel.messages.fetch({ limit: 100 });
    const message: Message = messages.find(mes => mes.author.id === this.client.user.id &&
      mes.embeds.length > 0 &&
      mes.embeds[0].type === 'rich' &&
      mes.embeds[0].footer &&
      mes.embeds[0].footer.text === `Case ${selected === 'latest' ? row.modlogs.length - 1 : (selected as number) - 1}`);

    if (message) {
      const embed: MessageEmbed = message.embeds[0];
      const [user] = embed.description.split('\n');
      embed.description = [user, `**Reason**: ${reason}`].join('\n');
      await message.edit({ embed });
    } else {
      const embed = new MessageEmbed()
        .setTitle(`User ${ModLog.title(log.type)}`)
        .setColor(ModLog.color(log.type))
        .setAuthor(log.moderator.tag, this.client.users.get(log.moderator.id).displayAvatarURL())
        .setDescription([
          `**Member**: ${log.user.tag} | ${log.user.id}`,
          `**Reason**: ${reason}`
        ].join('\n'))
        .setTimestamp()
        .setFooter(`Case ${selected === 'latest' ? row.modlogs.length : selected}`, this.client.user.displayAvatarURL({ format: 'jpg' }));
      await channel.send({ embed });
    }

    const oReason = log.reason;
    row.modlogs[selected === 'latest' ? row.modlogs.length - 1 : (selected as number) - 1].reason = reason;
    await this.provider.replace('modlogs', msg.guild.id, row);

    return msg.send(`Successfully updated the log \`#${selected}\`\n${'```http\n'}${[
      `Old reason : ${oReason || 'Not set.'}`,
      `New reason : ${reason}`
    ].join('\n')}${'```'}`);
  }

  private get provider() {
    return this.client.providers.default;
  }
}
