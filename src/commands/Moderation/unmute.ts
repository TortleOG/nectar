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
      requiredPermissions: ['MANAGE_GUILD'],
      description: 'Unmutes a muted user.',
      usage: `<user:user>`,
    });
  }

  public async run(msg: KlasaMessage, [user]: [KlasaUser]): Promise<KlasaMessage | KlasaMessage[]> {
    const role = msg.guild.roles.get((msg.guild.configs as NectarConfiguration).mod.muterole);
    if (!role) throw `❌ | I could not find a 'muted' role. Was it deleted?`;

    if (user.bot) throw `❌ | ${msg.author}, I cannot execute moderation actions against bots.`;

    const member: GuildMember = await msg.guild.members.fetch(user).catch(() => null);
    if (member.roles.highest.position >= msg.member.roles.highest.position) throw `❌ | ${msg.author}, I cannot execute moderation actions against this user.`;
    else if (!member.roles.has(role.id)) throw `❌ | ${msg.author}, this user is not muted.`;

    await member.roles.remove(role);

    if ((msg.guild.configs as NectarConfiguration).mod.modlog) {
      new ModLog(msg.guild)
        .type('unmute')
        .user(user)
        .moderator(msg.author)
        .reason('User unmute')
        .send();
    }

    return msg.send(`🔈 | **${msg.author.tag}** successfully muted **${member.user.tag}**.`);
  }
}
