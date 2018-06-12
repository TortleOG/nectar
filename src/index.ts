import { NectarClient as Client } from '../lib/Client';

const { token } : { token: string } = require('../settings.json');

const client: Client = new Client();

client.login(token);
