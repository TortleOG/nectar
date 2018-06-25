import { Command, CommandStore, CommandOptions, KlasaMessage, KlasaUser } from 'klasa';
import { GuildMember } from 'discord.js';

import { NectarClient, ModLog } from '../../index';
import { NectarConfiguration } from '../../../types/nectar_types';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 2,
      requiredPermissions: ['MANAGE_GUILD', 'MANAGE_ROLES'],
      description: 'Mutes a user from speaking in text channels.',
      usage: '<user:user> [reason:str] [...]',
      usageDelim: ' '
    });
  }

  public async run(msg: KlasaMessage, [user, ...strs]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
    const reason: string = strs.length > 0 ? strs.join(' ') : null;

    if (user.bot) throw `❌ | ${msg.author}, I cannot execute moderation actions against bots.`;

    const role = msg.guild.roles.get((msg.guild.configs as NectarConfiguration).mod.muterole);
    if (!role) throw `❌ | ${msg.author}, It seems I couldn't find a 'muted' role.`;

    const member: GuildMember = await msg.guild.members.fetch(user).catch(() => null);
    if (!member) throw `❌ | ${msg.author}, It seems I cannot find this user.`;
    else if (member.roles.highest.position >= msg.member.roles.highest.position) throw `❌ | ${msg.author}, I cannot mute a member with a higher position than you.`;

    try {
      await member.roles.add(role);

      if ((msg.guild.configs as NectarConfiguration).mod.modlog) {
        new ModLog(msg.guild)
          .type('mute')
          .user(user)
          .moderator(msg.author)
          .reason(reason)
          .send();
      }

      return msg.send(`🔇 | **${msg.author.tag}** successfully muted **${member.user.tag}** for *${reason}*.`);
    } catch (err) {
      this.client.console.error(err);
      return msg.send('Oops! It seems an error has occured. This shouldn\' have happened. Please contact the bot owner!');
    }
  }
}
