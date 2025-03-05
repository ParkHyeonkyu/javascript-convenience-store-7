import { nullFormatter } from '../utils/stringFormatter.js';
import throwError from '../utils/throwError.js';
import * as e from '../constants/error.js';
import readFile from '../utils/readFile.js';
import Promotion from './Promotion.js';

const PRODUCT_FILE_PATH = './public/products.md';

class StoreMachine {
  #products;
  #purchase;

  constructor() {
    this.#initProducts();
  }

  getProducts() {
    return this.#products;
  }

  checkCanBuy(purchaseList) {
    for (const { name, count } of purchaseList) {
      this.#validatePurchase(name, count);
    }
    this.#purchase = purchaseList;
  }

  getPromotionItemList() {
    const promotionItems = [];
    this.#purchase.forEach((purchaseItem) => {
      const product = this.#products.find((line) => line.name === purchaseItem.name);
      if (!product || !product.promotion) return;
      promotionItems.push({
        name: product.name,
        buyCount: purchaseItem.count,
        maxPromotionCount: product.quantity,
        promotionName: product.promotion,
      });
    });
    return promotionItems;
  }

  applyPromotion(buyAndGetList) {
    this.#purchase = this.#purchase.map((item) => {
      const matchingPromoItem = buyAndGetList.find((promoItem) => promoItem.name === item.name);
      return matchingPromoItem || item;
    });
  }

  noticeReceipt(noticeCallback) {
    const receipt = this.#purchase.map((item) => {
      const product = this.#products.find((product) => product.name === item.name);
      return {
        name: item.name,
        count: item.count,
        giftCount: item.giftCount || 0,
        price: product.price,
      };
    });
    return noticeCallback(receipt);
  }

  updateQuantity() {
    this.#purchase.forEach((purchaseItem) => {
      const totalPurchaseCount = this.#calculateTotalCount(purchaseItem);
      this.#processQuantityDeduction(purchaseItem, totalPurchaseCount);
    });
  }

  #calculateTotalCount(purchaseItem) {
    return purchaseItem.count + (purchaseItem.giftCount || 0);
  }

  #processQuantityDeduction(purchaseItem, totalPurchaseCount) {
    if (purchaseItem.isInPromotion) {
      this.#processPromotionPurchase(purchaseItem, totalPurchaseCount);
      return;
    }
    this.#processRegularPurchase(purchaseItem, totalPurchaseCount);
  }

  #processPromotionPurchase(purchaseItem, totalPurchaseCount) {
    const promotionProduct = this.#findProduct(purchaseItem.name, true);
    if (!promotionProduct) return;
    this.#deductPromotionQuantityFirst(promotionProduct, totalPurchaseCount);
  }

  #processRegularPurchase(purchaseItem, totalPurchaseCount) {
    const regularProduct = this.#findProduct(purchaseItem.name, false);
    if (!regularProduct) return;
    this.#deductRegularQuantityFirst(regularProduct, totalPurchaseCount);
  }

  #findProduct(name, isPromotion) {
    return this.#products.find((p) => p.name === name && !!p.promotion === isPromotion);
  }

  #validatePurchase(item, count) {
    const filteredProducts = this.#products.filter((line) => line.name === item);
    if (filteredProducts.length === 0) throwError(e.NOT_EXIST_ITEM);

    const totalQuantity = filteredProducts.reduce((acc, line) => acc + line.quantity, 0);
    if (totalQuantity < count) throwError(e.OVER_PURCHASE_COUNT);
  }

  #initProducts() {
    const content = readFile(PRODUCT_FILE_PATH);
    this.#products = content.map((line) => {
      const [name, price, quantity, promo] = line.split(',');
      const promotion = nullFormatter(promo);
      return { name, price: Number(price), quantity: Number(quantity), promotion: promotion };
    });
  }

  #deductPromotionQuantityFirst(product, totalPurchaseCount) {
    if (product.quantity >= totalPurchaseCount) {
      product.quantity -= totalPurchaseCount;
      return;
    }

    const remainingCount = totalPurchaseCount - product.quantity;
    product.quantity = 0;

    const regularProduct = this.#findProduct(product.name, false);
    if (!regularProduct) return;
    regularProduct.quantity -= remainingCount;
  }

  #deductRegularQuantityFirst(product, totalPurchaseCount) {
    if (product.quantity >= totalPurchaseCount) {
      product.quantity -= totalPurchaseCount;
      return;
    }

    const remainingCount = totalPurchaseCount - product.quantity;
    product.quantity = 0;

    const promotionProduct = this.#findProduct(product.name, true);
    if (!promotionProduct) return;
    promotionProduct.quantity -= remainingCount;
  }
}

export default StoreMachine;