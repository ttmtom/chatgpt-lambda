import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

class ChatGptService {
  private readonly configuration: Configuration;
  private readonly openai: OpenAIApi;
  constructor() {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async getList() {
    const res = await this.openai.listModels();
    return res.data;
  }
  async chat(model: string, messages: ChatCompletionRequestMessage[]) {
    try {
      const chatCompletion = await this.openai.createChatCompletion({
        model,
        messages,
      });
      console.log(chatCompletion.data.choices);
      return chatCompletion.data.choices;
    } catch (err) {
      console.log(err);
      return ''
    }
  }
}

export const chatGptService = new ChatGptService();
