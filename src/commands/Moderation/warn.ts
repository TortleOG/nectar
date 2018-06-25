import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';

import { NectarClient } from '../../../lib/Client';
import { NectarConfiguration } from '../../../types/nectar_types';
import { ModLog } from '../../../lib/moderation/ModLog';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 2,
      description: 'Warns a user that is disobeying the rules.',
      usage: '<user:user> [reason:str] [...]',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [user, ...strs]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
    const reason: string = strs.length > 0 ? strs.join(' ') : null;

    if (user.bot) throw `❌ | ${msg.author}, I cannot execute moderation actions against bots.`;
    else if (msg.guild.member(user).roles.highest.position >= msg.member.roles.highest.position) throw `❌ | ${msg.author}, I cannot execute moderation actions against this user.`;

    if ((msg.guild.configs as NectarConfiguration).mod.modlog) {
      new ModLog(msg.guild)
        .type('warn')
        .user(user)
        .moderator(msg.author)
        .reason(reason)
        .send();
    }

    return msg.send(`⚠ | **${msg.author.tag}** successfully warned **${user.tag}** for *${reason}*.`);
  }
}
