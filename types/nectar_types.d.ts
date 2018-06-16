import { Configuration } from 'klasa';
import { Snowflake } from 'discord.js';

export class NectarConfiguration extends Configuration {
  public mod: NectarModSchema;
}

export type NectarModSchema = {
  modlog: Snowflake;
}

export type RowModLog = {
  modlogs: object[];
}
