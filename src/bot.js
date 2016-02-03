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
    if (message.text) {
      if (message.text.startsWith('/start')) {
        const startMessage = 'Hi! Send me any sticker and I\'ll give you back its PNG file. ' +
                             'What could you use that for? You can create your own sticker pack with only the stickers you like. ' +
                             'How? Type /help and I\'ll give you the details.';
        this.client.sendText(startMessage, message.chat.id);
      }

      if (message.text.startsWith('/help')) {
        const helpMessage = 'This bot is pretty much a workaround for not being able to save individual stickers in Telegram.\n\n' +
                            'Go and talk with @Stickers, there you\'ll be able to create your own sticker pack. At some point, ' +
                            'it will ask you to send it the image you want for your own sticker. Come here, send me the sticker ' +
                            'you want, and I\'ll give you the image back. Forward that to @Stickers and that\'s it! You\'ll ' +
                            'start building your own personalized stickers pack.';
        this.client.sendText(helpMessage, message.chat.id);
      }

      return;
    }

    if (message.sticker) {
      this.client.getFile(message.sticker.file_id).then(webpFile => {
        return new DWebp(webpFile).toBuffer();
      }).then(pngStream => this.client.sendFile(pngStream, message.chat.id));
    }
  }
}
