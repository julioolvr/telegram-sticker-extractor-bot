import TelegramClient from './services/telegramClient';
import { DWebp } from 'cwebp';

/**
 * @class Bot to respond to messages from Telegram users.
 */
export default class {
  constructor({ client = new TelegramClient(process.env.BOT_TOKEN) } = {}) {
    this.client = client;
  }

  respondTo(message) {
    if (message.sticker) {
      this.client.getFile(message.sticker.file_id).then(webpFile => {
        return new DWebp(webpFile).toBuffer();
      }).then(pngStream => this.client.sendFile(pngStream, message.chat.id));
    }
  }
}
