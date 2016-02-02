import rp from 'request-promise';
import request from 'request';
import got from 'got';

/**
 * @class Client to communicate with Telegram's API.
 */
export default class {
  /**
   * @param {string} token Token for the bot provided by Telegram.
   */
  constructor(token) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Sends a text message to the given chatId.
   * @param  {string} text   Text to send on the message.
   * @param  {number} chatId Id of the chat to send the message to.
   * @return {Promise}       A promise for the request to Telegram's API.
   */
  sendText(text, chatId) {
    return rp.post(`${this.baseUrl}/sendMessage`, { form: { text: text, chat_id: chatId } });
  }

  getFile(fileId) {
    return rp.get(`${this.baseUrl}/getFile`, { qs: { file_id: fileId } })
      .then(response => JSON.parse(response).result)
      .then(fileData => {
        return got.stream(`https://api.telegram.org/file/bot${this.token}/${fileData.file_path}`);
      });
  }

  sendFile(file, chatId) {
    return rp.post(`${this.baseUrl}/sendDocument`, { formData: {
      chat_id: chatId,
      document: {
        value: file,
        options: {
          contentType: 'image/png',
          filename: 'sticker.png'
        }
      }
    } });
  }

  /**
   * Long-polls Telegram's API to get new messages. It will remember the latest update and
   * query starting from the next one on subsequent calls.
   * @return {Promise} A promise for the request to Telegram's API, converting updates to messages.
   */
  getUpdates() {
    let options = { timeout: 60 };

    if (this.lastOffset !== undefined) {
      options.offset = this.lastOffset + 1;
    }

    return rp.get({url: `${this.baseUrl}/getUpdates`, qs: options})
      .then(response => JSON.parse(response).result)
      .then(updates => {
        if (updates.length === 0) {
          return [];
        }

        let ids = updates.map(update => update.update_id);
        this.lastOffset = Math.max(...ids);
        return updates.map(update => update.message);
      });
  }
}
