import readFile from '../utils/readFile.js';
import { DateTimes } from '@woowacourse/mission-utils';
import { parseDateTime } from '../utils/stringFormatter.js';

const PROMOTION_FILE_PATH = './public/promotions.md';

class Promotion {
  /**
   * @type {Object.<string, {buy: number, get: number, startDate: string, endDate: string}>} 프로모션 이름 : {}
   */
  #promotions;
  /**
   * @type {Array<{name: string, buyCount: number, getCount: number, isInPromotion:bool, canGetMoreCount?: number, cannotApplyPromotionCount?: number}>}
   */
  #promotionItems;

  /**
   * @constructor
   * @param {Array<{name, buyCount, maxPromotionCount, promotionName}>} items - 상품명, 구매 개수, 프로모션 적용 최대 갯수, 프로모션 이름
   */
  constructor(items) {
    this.#initPromotions();
    this.#promotionItems = this.#applyPromotion(items);
  }

  /**
   * @return {Array<{name: string, buyCount: number, getCount: number, isInPromotion: bool canGetMoreCount?: number, cannotApplyPromotionCount?: number}>} - 상품명, 구매 수량, 증정품 수량, 누락 증정품 수량, 프로모션 적용 불가 수량, 프로모션션 기간 중
   */
  #applyPromotion(items) {
    const applyPromotion = [];
    items.forEach((item) => {
      const promotionItemObject = { name: item.name, buyCount: item.buyCount, getCount: 0 };
      if (!this.#isPromotionAvailable(item)) {
        promotionItemObject.isInPromotion = false;
        applyPromotion.push(promotionItemObject);
        return;
      }

      promotionItemObject.isInPromotion = true;
      applyPromotion.push(promotionItemObject);

      const giftList = this.#checkGift(item);
      applyPromotion[applyPromotion.length - 1] = Object.assign(
        applyPromotion[applyPromotion.length - 1],
        giftList
      );
    });
    return applyPromotion;
  }

  /**
   * 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우의 상품명과 누락된 증정 상품 수량을 View로 전달
   * @return {Array<{name:string, canGetMoreCount:number}>}
   */
  getAvailableMoreGiftList() {
    return this.#promotionItems
      .filter((item) => item.canGetMoreCount !== undefined)
      .map((item) => ({
        name: item.name,
        canGetMoreCount: item.canGetMoreCount,
      }));
  }

  /**
   * 프로모션 혜택 없이 결제해야하는 상품의 상품명과 수량을 View로 전달
   * @returns {Array<{name:string, disablePromotionCount:number}>}
   */
  getDisablePromotionList() {
    return this.#promotionItems
      .filter((item) => item.cannotApplyPromotionCount !== undefined)
      .map((item) => ({
        name: item.name,
        disablePromotionCount: item.cannotApplyPromotionCount,
      }));
  }

  /**
   * 최종 프로모션 적용 결과 전달
   * @returns {Array<{name: string, count: number, giftCount?: number, isInPromotion:bool}>}
   */
  getBuyAndGetList() {
    return this.#promotionItems.map((item) => ({
      name: item.name,
      count: item.buyCount,
      giftCount: item.getCount,
      isInPromotion: item.isInPromotion,
    }));
  }

  /**
   * 누락된 증정 상품에 대한 응답 처리
   * @param {string} name
   */
  manageExtraGift(name) {
    const item = this.#promotionItems.find((item) => item.name === name);
    item.getCount += item.canGetMoreCount;
  }

  /**
   * 프로모션 적용 불가 상품의 정가 결제 여부에 대한 응답 처리
   * @param {string} name
   */
  manageDisablePromotionItem(name) {
    const item = this.#promotionItems.find((item) => item.name === name);
    item.buyCount -= item.cannotApplyPromotionCount;
  }

  /**
   * 프로모션 적용이 가능한 상품에 대해 구매 수량, 증정 상품 수량, 증정 상품 누락 수량 확인
   * @param {{name, buyCount, maxPromotionCount,promotionName}} item 상품 정보
   * @return {{name, buyCount, getCount, canGetMoreCount?:number, cannotApplyPromotionCount?: number}}
   */
  #checkGift({ name, buyCount, maxPromotionCount, promotionName } = item) {
    const promotion = this.#promotions[promotionName];
    const result = this.#checkPromotion(name, buyCount, maxPromotionCount, promotion);

    if (!this.#hasMoreGift(buyCount, maxPromotionCount, promotion)) return result;
    return Object.assign(result, { canGetMoreCount: promotion.get });
  }

  /**
   * 구매 상품과 증정 상품의 개수 및 프로모션 적용 불가 개수 확인
   * @param {*} name 구매 상품명
   * @param {*} buyCount 구매 개수
   * @param {*} maxPromotionCount 프로모션 재고
   * @param {{buy, get, startDate, endDate}} promotion 구매 상품의 프로모션 정보
   * @returns {{name:string, buyCount:number, getCount:number, cannotApplyPromotionCount?:number}}
   */
  #checkPromotion(name, buyCount, maxPromotionCount, promotion) {
    const bundle = promotion.buy + promotion.get;
    const set = Math.floor(Math.min(buyCount, maxPromotionCount) / bundle);
    const getCount = promotion.get * set;
    const remains = buyCount - set * bundle;

    if (buyCount >= maxPromotionCount) {
      return { name, buyCount: buyCount - getCount, getCount, cannotApplyPromotionCount: remains };
    }
    buyCount -= getCount;
    return { name, buyCount, getCount };
  }

  /**
   * 증정 상품을 더 받을 수 있는지 확인
   * @param {int} buyCount 구매 개수
   * @param {int} maxPromotionCount 프로모션 재고
   * @param {{buy, get, startDate, endDate}} promotion 구매 상품의 프로모션 정보
   * @return {bool}
   */
  #hasMoreGift(buyCount, maxPromotionCount, promotion) {
    const canGetMoreCount = buyCount % (promotion.buy + promotion.get) === promotion.buy;
    const notOverPromotionStock = buyCount + promotion.get <= maxPromotionCount;
    return canGetMoreCount && notOverPromotionStock;
  }

  /**
   * 해당 상품이 프로모션 적용 가능한지 확인
   * @param {name, buyCount, maxPromotionCount,promotionName} item - 상품 정보
   * @returns {boolean} 프로모션 적용 가능 여부
   */
  #isPromotionAvailable(item) {
    const promotion = this.#promotions[item.promotionName];
    return promotion && this.#isInPromotionDuration(item.promotionName);
  }

  #isInPromotionDuration(promotionName) {
    const today = parseDateTime(DateTimes.now());
    const startDate = this.#promotions[promotionName].startDate;
    const endDate = this.#promotions[promotionName].endDate;

    return today >= startDate && today <= endDate;
  }

  #initPromotions() {
    const content = readFile(PROMOTION_FILE_PATH);
    this.#promotions = content.reduce((acc, line) => {
      const [name, buy, get, startDate, endDate] = line.split(',');
      acc[name] = { buy: Number(buy), get: Number(get), startDate, endDate };
      return acc;
    }, {});
  }
}

export default Promotion;