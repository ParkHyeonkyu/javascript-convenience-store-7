import StoreMachine from '../models/StoreMachine.js';
import Promotion from '../models/Promotion.js';
import Output from '../views/Output.js';
import Input from '../views/Input.js';
import retryOnError from '../utils/retryOnError.js';
import mergeSameItems from '../utils/mergeSameItems.js';
import Receipt from '../models/Receipt.js';

class Store {
  #storeMachine;
  /**
   * @type {Promotion}
   */
  #promotion;

  constructor() {
    this.#storeMachine = new StoreMachine();
  }

  async run() {
    let continueShoppingFlag = true;

    while (continueShoppingFlag) {
      await this.#runStore();
      continueShoppingFlag = await this.#checkMoreShopping();
    }
  }

  async #runStore() {
    this.openStore();
    await retryOnError(this.#purchase.bind(this));
    await this.#applyPromotion();
    const membership = await this.#checkMembership();
    this.#managePurchaseResult(membership);
  }

  openStore() {
    Output.greeting();
    const products = this.#storeMachine.getProducts();
    Output.productsInfo(products);
  }

  async #purchase() {
    const inputList = await Input.purchase();
    const purchaseList = mergeSameItems(inputList);

    this.#storeMachine.checkCanBuy(purchaseList);
  }

  async #applyPromotion() {
    const promotionItems = this.#storeMachine.getPromotionItemList();
    this.#promotion = new Promotion(promotionItems);

    const availableMoreGiftList = this.#promotion.getAvailableMoreGiftList();
    await this.#noticeMissingItems(availableMoreGiftList);

    const disablePromotionList = this.#promotion.getDisablePromotionList();
    await this.#noticeDisablePromotions(disablePromotionList);
    this.#storeMachine.applyPromotion(this.#promotion.getBuyAndGetList());
  }

  async #checkMembership() {
    const answer = await retryOnError(() => Input.noticeMembership());
    if (answer === 'N') return false;
    return true;
  }

  #managePurchaseResult(membership) {
    this.#storeMachine.updateQuantity();
    const receipt = this.#storeMachine.noticeReceipt(
      (purchase) => new Receipt(purchase, membership)
    );
    this.#printReceipt(receipt);
  }

  async #checkMoreShopping() {
    const answer = await retryOnError(() => Input.moreShopping());
    if (answer === 'N') return false;
    return true;
  }

  async #noticeMissingItems(availableMoreGiftList) {
    for (const item of availableMoreGiftList) {
      const { name, canGetMoreCount: giftCount } = item;
      const answer = await retryOnError(() => Input.noticeMoreGift(name, giftCount));

      if (answer === 'N') return;
      this.#promotion.manageExtraGift(name);
    }
  }

  async #noticeDisablePromotions(disablePromotionList) {
    for (const item of disablePromotionList) {
      const { name, disablePromotionCount: itemCount } = item;
      const answer = await retryOnError(() => Input.noticeDisablePromotion(name, itemCount));

      if (answer === 'Y') return;
      this.#promotion.manageDisablePromotionItem(name);
    }
  }

  /**
   *
   * @param {Receipt} receipt
   */
  #printReceipt(receipt) {
    receipt.purchaseItems((list) => Output.purchaseItems(list));
    receipt.giftItems((list) => Output.giftItems(list));
    receipt.receiptResult((list) => Output.receiptResult(list));
  }
}

export default Store;