import { Console } from '@woowacourse/mission-utils';
import { toPrintInfo, thousandComma } from '../utils/stringFormatter.js';
import * as o from '../constants/output.js';

const Output = {
  greeting() {
    Console.print(o.GREETING);
  },

  productsInfo(products) {
    products.map((product) => Console.print(toPrintInfo(product)));
    Console.print('');
  },

  purchaseItems(purchase) {
    Console.print(o.STORE);
    Console.print(o.COLUMN);

    purchase.forEach((item) => {
      Console.print(`${item.name}\t\t${item.count}\t\t${thousandComma(item.price)}`);
    });
  },

  giftItems(gift) {
    Console.print(o.GIFT);
    gift.forEach((item) => {
      Console.print(`${item.name}\t\t${item.giftCount}`);
    });
  },

  receiptResult(result) {
    Console.print(o.LINE);
    Console.print(`총구매액\t${result.quantity}\t\t${thousandComma(result.amount)}`);
    Console.print(`행사할인\t\t\t-${thousandComma(result.promotionDiscount)}`);
    Console.print(`멤버십할인\t\t\t-${thousandComma(result.membershipDiscount)}`);
    Console.print(`내실돈\t\t\t${thousandComma(result.payment)}`);
  },
};

export default Output;