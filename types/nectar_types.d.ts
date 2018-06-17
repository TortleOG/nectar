import { Configuration } from 'klasa';
import { Snowflake } from 'discord.js';

export class NectarConfiguration extends Configuration {
  public mod: NectarModSchema;
}

export type NectarModSchema = {
  modlog: Snowflake;
}

export type RowModLog = {
  modlogs: ModLogData[];
}

export type ModLogData = {
  type: string;
  user: {
    tag: string;
    id: Snowflake;
  };
  moderator: {
    tag: string;
    id: Snowflake;
  };
  reason: string;
}
