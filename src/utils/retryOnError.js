import { Console } from '@woowacourse/mission-utils';

const retryOnError = async (func) => {
  try {
    return await func();
  } catch (error) {
    Console.print(error.message);
    return await retryOnError(func);
  }
};

export default retryOnError;