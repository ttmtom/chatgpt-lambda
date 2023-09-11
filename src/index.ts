import { APIGatewayProxyEvent, SQSRecord } from 'aws-lambda';
import { TChatGptLambdaEvent, TChatGptLambdaInput } from './types/chatgptLambda.type';
import { chatgptController } from './controllers/chatgpt.controller';
import { sqsService } from './services/sqs.service';

const isGatewayEvent = (event: APIGatewayProxyEvent | TChatGptLambdaEvent): event is APIGatewayProxyEvent => {
  return typeof event.body === 'string';
}

const apiGatewayBodyValidation = (body: any): body is TChatGptLambdaInput => {
  return Array.isArray(body.messages);
}
const extractEvent = (event: APIGatewayProxyEvent | TChatGptLambdaEvent): {
  body: TChatGptLambdaInput | null,
  resource: string
} => {
  if (isGatewayEvent(event)) {
    const temp = JSON.parse(event.body ?? '{}');
    if (!apiGatewayBodyValidation(temp)) {
      throw new Error('invalid body');
    }
    return {
      resource: event.resource,
      body: temp
    };
  }
  return event;
}
export const apiHandler = async (event: APIGatewayProxyEvent | TChatGptLambdaEvent) => {
  console.log('--- event: ' + JSON.stringify(event, null, 2));
  const {body, resource} = extractEvent(event);
  switch (resource) {
    case '/chat': {
      if (!body) throw new Error('invalid body');
      const res = await sqsService.sendMessage(body.userId, body);
      console.log('--- pushed to sqs', res.MessageId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          msgId: res.MessageId,
        }),
      }
    }
    case '/list': {
      return await chatgptController.list();
    }
    default: {
      console.log('---- unexpected ----');
    }
  }
  return {
    statusCode: 404,
    body: 'source not found',
  }
}

export const consumerHandler = async ({ Records }: {Records: SQSRecord[]}) => {
  console.log('--- event: ' + JSON.stringify(Records, null, 2));
  const body = JSON.parse(Records[0].body) as TChatGptLambdaInput;
  const res = await chatgptController.chat(body.model, body.messages);
  console.log('---- gpt response');
  console.log(JSON.stringify(res.body));
  const input = {
    chatId: body.chatId,
    userId: body.userId,
    session: body.session,
    messages: JSON.parse(res.body),
  }
  await fetch(process.env.CHANNEL_CALLBACK_URL || '', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-secret": process.env.ENDPOINT_SECRET || '',
    },
    body: JSON.stringify(input),
  }).then((res) => res.json()).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log('err', err);
  });
  return {
    statusCode: 200, body: ''
  }
}
