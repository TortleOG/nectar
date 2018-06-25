import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';

import { NectarClient } from '../../../lib/Client';
import { ModLog } from '../../../lib/moderation/ModLog';
import { NectarConfiguration } from '../../../types/nectar_types';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 3,
      requiredPermissions: ['BAN_MEMBERS'],
      description: 'Unbans a member from the guild.',
      usage: '<user:user> [reason:str] [...]',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [user, ...strs]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
    const reason: string = strs.length > 0 ? strs.join(' ') : null;

    const bans = await msg.guild.fetchBans();
    if (!bans.has(user.id)) throw `❌ | ${msg.author}, this user is not banned.`;

    await msg.guild.members.unban(user, reason);

    if ((msg.guild.configs as NectarConfiguration).mod.modlog) {
      new ModLog(msg.guild)
        .type('unban')
        .user(user)
        .moderator(msg.author)
        .reason(reason)
        .send();
    }

    return msg.send(`✅ | **${msg.author.tag}** successfully unbanned **${user.tag}** for *${reason}*.`);
  }
}
