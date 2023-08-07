export const handler = () => {
  console.log('---- index ----');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello world' }),
  };
};
