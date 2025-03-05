import { Console } from '@woowacourse/mission-utils';
import { PURCHASE, MEMBERSHIP, MORE_SHOPPING } from '../constants/input.js';
import { validatePurchase, validateYNAnswer } from '../utils/validator.js';

const Input = {
  async purchase() {
    const input = await this.getUserInput(PURCHASE);
    return validatePurchase(input);
  },

  /**
   * @returns {'Y'|'N'}
   */
  async noticeMoreGift(name, number) {
    const caption = `\n현재 ${name}은(는) ${number}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`;
    const input = await this.getUserInput(caption);
    return validateYNAnswer(input);
  },

  /**
   * @returns {'Y'|'N'}
   */
  async noticeDisablePromotion(name, number) {
    const caption = `\n현재 ${name} ${number}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`;
    const input = await this.getUserInput(caption);
    return validateYNAnswer(input);
  },

  async noticeMembership() {
    const input = await this.getUserInput(MEMBERSHIP);
    return validateYNAnswer(input);
  },

  async moreShopping() {
    const input = await this.getUserInput(MORE_SHOPPING);
    return validateYNAnswer(input);
  },

  async getUserInput(caption) {
    const input = await Console.readLineAsync(caption);
    return input;
  },
};

export default Input;