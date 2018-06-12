import { Client as KlasaClient } from 'klasa';

export class NectarClient extends KlasaClient {
  public constructor() {
    super({
      prefix: 'n!',
      commandEditing: true,
      fetchAllMembers: true,
      disabledEvents: [
        'TYPING_START',
        'RELATIONSHIP_ADD',
        'RELATIONSHIP_REMOVE',
        'CHANNEL_PINS_UPDATE',
        'PRESENCE_UPDATE',
        'USER_UPDATE',
        'USER_NOTE_UPDATE'
      ]
    });
  }
}
