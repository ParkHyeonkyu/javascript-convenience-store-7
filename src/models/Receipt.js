class Receipt {
    /**
     * @type {Array<{name:string, count: number, giftCount: number, price:number}>}
     */
    #purchase;
    #membership;
  
    constructor(purchase, membership) {
      this.#purchase = purchase;
      this.#membership = membership;
    }
  
    purchaseItems(outputCallback) {
      const list = this.#purchase.map((item) => {
        return {
          name: item.name,
          count: item.count + item.giftCount,
          price: item.price * (item.count + item.giftCount),
        };
      });
      outputCallback(list);
    }
  
    giftItems(outputCallback) {
      const result = this.#purchase
        .filter((item) => item.giftCount !== 0)
        .map((item) => ({ name: item.name, giftCount: item.giftCount }));
      outputCallback(result);
    }
  
    receiptResult(outputCallback) {
      outputCallback(this.#calculateReceiptResult());
    }
  
    #calculateReceiptResult() {
      const { quantity, amount } = this.#calculateTotalPurchaseAmount();
      const promotionDiscount = this.#calculatePromotionDiscount();
      const membershipDiscount = this.#calculateMembershipDiscount();
      const payment = amount - promotionDiscount - membershipDiscount;
      return { quantity, amount, promotionDiscount, membershipDiscount, payment };
    }
  
    #calculateTotalPurchaseAmount() {
      return this.#purchase.reduce(
        (acc, curr) => {
          acc.quantity += curr.count + curr.giftCount;
          acc.amount += curr.price * (curr.count + curr.giftCount);
          return acc;
        },
        { quantity: 0, amount: 0 }
      );
    }
  
    #calculatePromotionDiscount() {
      return this.#purchase
        .filter((item) => item.giftCount !== 0)
        .reduce((acc, curr) => {
          acc += curr.price * curr.giftCount;
          return acc;
        }, 0);
    }
  
    #calculateMembershipDiscount() {
      if (!this.#membership) return 0;
      const nonPromotionAmount = this.#purchase
        .filter((item) => item.giftCount === 0)
        .reduce((acc, curr) => {
          acc += curr.price * curr.count;
          return acc;
        }, 0);
      const discount = Math.floor(nonPromotionAmount * 0.3);
      return Math.min(discount, 8000);
    }
  }
  
  export default Receipt;