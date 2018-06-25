import { Command, CommandStore, CommandOptions, KlasaMessage } from 'klasa';

import { NectarClient } from '../../index';
import { RowModLog, ModLogData } from '../../../types/nectar_types';

export default class extends Command {
  public constructor(client: NectarClient, store: CommandStore, file: string[], core: boolean, options?: CommandOptions) {
    super(client, store, file, core, {
      runIn: ['text'],
      cooldown: 5,
      permissionLevel: 2,
      description: 'Looks for a case in the saved modlogs.',
      usage: '<case:int|latest>',
      usageDelim: ' '
    });
  }

  public async init(): Promise<void> {
    if (!(await this.provider.hasTable('modlogs'))) await this.provider.createTable('modlogs');
  }

  public async run(msg: KlasaMessage, [selected]: [number | string]): Promise<KlasaMessage | KlasaMessage[]> {
    const { modlogs }: { modlogs: ModLogData[] } = await this.provider.get('modlogs', msg.guild.id) as RowModLog;
    const log: ModLogData = modlogs[selected === 'latest' ? modlogs.length - 1 : (selected as number) - 1];

    if (!log) throw `❌ | ${msg.author}, there are no modlogs with that case number.`;

    return msg.send([
      `Type: ${log.type}`,
      `User: ${log.user.tag} | ${log.user.id}`,
      `Moderator: ${log.moderator.tag} | ${log.moderator.id}`,
      `Reason: ${log.reason}`
    ], { code: 'http' });
  }

  private get provider() {
    return this.client.providers.default;
  }
}
