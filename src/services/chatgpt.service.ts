import { Configuration, OpenAIApi } from 'openai';

class ChatGptService {
  private readonly configuration: Configuration;
  private readonly openai: OpenAIApi;
  constructor() {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
  }
  async chat() {
    const temp = await this.openai.listModels();
    console.log(temp.data.data);

    try {
      const chatCompletion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: "Hello world"}],
      });
      console.log(chatCompletion.data.choices);
      return chatCompletion;
    } catch (err) {
      console.log(err);
      return ''
    }
  }
}

export const chatGptService = new ChatGptService();
