import { KlasaGuild, KlasaMessage, KlasaTextChannel } from 'klasa';
import { GuildChannel, MessageEmbed, User } from 'discord.js';
import { NectarClient } from '../Client';

import { NectarConfiguration, RowModLog } from '../../types/nectar_types';

export class ModLog {
  private guild: KlasaGuild;
  private client: NectarClient;

  private _type: string;
  private _user: {
    id: string;
    tag: string;
  };
  private _moderator: {
    id: string;
    tag: string;
  };
  private _reason: string;
  private _case: number;

  public constructor(guild: KlasaGuild) {
    Object.defineProperty(this, 'guild', { value: guild });

    Object.defineProperty(this, 'client', { value: guild.client });

    this._type = null;
    this._user = null;
    this._moderator = null;
    this._reason = null;
  }

  public type(name: string): this {
    this._type = name;
    return this;
  }

  public user(user: User): this {
    this._user = {
      id: user.id,
      tag: user.tag
    };
    return this;
  }

  public moderator(user: User): this {
    this._moderator = {
      id: user.id,
      tag: user.tag
    };
    return this;
  }

  public reason(str: string): this {
    this._reason = str;
    return this;
  }

  public async send(): Promise<KlasaMessage | KlasaMessage[]> {
    const modlog: KlasaTextChannel = this.guild.channels.get((this.guild.configs as NectarConfiguration).mod.modlog) as KlasaTextChannel;
    if (!modlog) throw 'The modlog channel does not exist. Was it deleted?';
    this._case = await this._getCase();
    return modlog.send({ embed: this._embed });
  }

  private async _getCase(): Promise<number> {
    const row = await this.provider.get('modlogs', this.guild.id) as RowModLog;
    if (!row) {
      this._case = 1;
      return this.provider.create('modlogs', this.guild.id, { modlogs: [this._pack] }).then(() => 1);
    }
    this._case = row.modlogs.length + 1;
    row.modlogs.push(this._pack);
    await this.provider.update('modlogs', this.guild.id, row);
    return row.modlogs.length;
  }

  private get _pack() {
    return {
      type: this._type,
      user: this._user,
      moderator: this._moderator,
      reason: this._reason,
      case: this._case
    };
  }

  private get _embed() {
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(ModLog._color(this._type))
      .setTitle(ModLog._title(this._type))
      .setAuthor(this._moderator.tag, this.client.users.get(this._moderator.id).displayAvatarURL())
      .setDescription([
        `**Member**: ${this._user.tag} | ${this._user.id}`,
        `**Reason**: ${this._reason || 'No reason specified.'}`
      ])
      .setFooter(`Case ${this._case}`, this.client.user.displayAvatarURL())
      .setTimestamp();
    return embed;
  }

  private static _title(type: string): string {
    switch (type) {
      case 'ban': return 'Banned';
      case 'unban': return 'Unbanned';
      case 'mute': return 'Muted';
      case 'unmute': return 'Unmuted';
      case 'kick': return 'Kicked';
      case 'warn': return 'Warned';
      default: return '{{Unknown Action}}';
    }
  }

  private static _color(type: string): number {
    switch (type) {
      case 'ban': return 0xcc0000;
      case 'unban': return 0x2d862d;
      case 'kick': return 0xe65c00;
      case 'mute':
      case 'unmute': return 0x993366;
      case 'warn': return 0xf2f20d;
      default: return 0xffffff;
    }
  }

  private get provider() {
    return this.client.providers.default;
  }

}
