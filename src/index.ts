import { NectarClient as Client } from '../lib/Client';

const { token }: { token: string } = require('../settings.json');

const client: Client = new Client();

client.login(token);

// Export Types
import { ModLog } from '../lib/moderation/ModLog';

export {
  // Client
  Client as NectarClient,

  // Classes
  ModLog
};
