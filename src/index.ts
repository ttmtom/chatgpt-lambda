import { chatGptService } from './services/chatgpt.service';

export const handler = async () => {
  console.log('--- hii  handler');
  const res = await chatGptService.chat();
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  }
}