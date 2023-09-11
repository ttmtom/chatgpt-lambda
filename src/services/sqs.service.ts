import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { TSqsChatMessage } from '../types/sqsMessage.type';

class SqsService {
  private readonly sqsClient = new SQSClient({ region: "ap-southeast-1" });
  private readonly sqsQueueUrl = process.env.SQS_QUEUE_URL || '';

  async sendMessage(userId: string, message: TSqsChatMessage) {
    const input = {
      QueueUrl: this.sqsQueueUrl,
      MessageGroupId: userId,
      MessageBody: JSON.stringify(message),
    };
    const command = new SendMessageCommand(input);
    return await this.sqsClient.send(command);
  }
}

export const sqsService = new SqsService();
