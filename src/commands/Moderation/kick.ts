import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';
import { GuildMember } from 'discord.js';

import { NectarClient, ModLog } from '../../index';
import { NectarConfiguration } from '../../../types/nectar_types';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 3,
      requiredPermissions: ['KICK_MEMBERS'],
      description: 'Kicks a member from the guild.',
      usage: '<user:user> [reason:str] [...]',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [user, ...strs]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
    const reason: string = strs.length > 0 ? strs.join(' ') : null;

    if (user.bot) throw `❌ | ${msg.author}, I cannot execute moderation actions against bots.`;

    const member: GuildMember = await msg.guild.members.fetch(user).catch(() => null);

    if (!member) throw `❌ | ${msg.author}, It seems I cannot find this user.`;
    else if (!member.bannable) throw `❌ | ${msg.author}, I cannot kick this member.`;
    else if (member.roles.highest.position >= msg.member.roles.highest.position) throw `❌ | ${msg.author}, I cannot kick a member with a higher position than you.`;

    await member.kick(reason);

    if ((msg.guild.configs as NectarConfiguration).mod.modlog) {
      new ModLog(msg.guild)
        .type('kick')
        .user(user)
        .moderator(msg.author)
        .reason(reason)
        .send();
    }

    return msg.send(`🛑 | **${msg.author.tag}** successfully kicked **${member.user.tag}** for *${reason}*.`);
  }
}
