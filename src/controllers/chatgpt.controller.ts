import { chatGptService } from '../services/chatgpt.service';
import { ChatCompletionRequestMessage } from 'openai';

class ChatgptController {
  async chat(model = 'gpt-3.5-turbo', messages: ChatCompletionRequestMessage[]) {
    try {
      const res = await chatGptService.chat(model, messages);
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      }
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      }
    }
  }

  async list() {
    try {
      const res = await chatGptService.getList();
      return {
        statusCode: 200,
        body: JSON.stringify(res.data.map((model) => model.id)),
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify(err),
      }
    }
  }
}

export const chatgptController = new ChatgptController();
