import { ChangeParser } from '../src/parser.js';

const mockRawEvent = {
  lsn: '0/16C1A28',
  xid: 745,
  data: '{"change":[{"kind":"insert","schema":"public","table":"users","columnnames":["id","name","email"],"columnvalues":[1,"Alice","alice@example.com"]}]}'
};

const parser = new ChangeParser();
const parsed = parser.parse(mockRawEvent);
console.log('Parsed:', parsed);