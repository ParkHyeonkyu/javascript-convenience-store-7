import { DateTimes } from '@woowacourse/mission-utils';
import Promotion from '../src/models/Promotion.js';

jest.mock('@woowacourse/mission-utils');

describe('Promotion', () => {
  beforeEach(() => {
    // readFile 모킹을 직접 Promotion 내부에서 처리
    jest.spyOn(DateTimes, 'now').mockReturnValue('2024-06-15T00:00:00');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('정상적인 프로모션 적용', () => {
    test('2+1 프로모션이 정상적으로 적용되어야 한다', async () => {
      // given
      const items = [
        {
          name: '콜라',
          buyCount: 3,
          maxPromotionCount: 10,
          promotionName: '탄산2+1',
        },
      ];

      // when
      const promotion = new Promotion(items);
      const result = promotion.getBuyAndGetList();

      // then
      expect(result).toEqual([
        {
          name: '콜라',
          count: 2,
          giftCount: 1,
          isInPromotion: true,
        },
      ]);
    });
  });

  describe('프로모션 기간 검증', () => {
    test('프로모션 기간이 지난 상품은 프로모션이 적용되지 않아야 한다', async () => {
      // given
      jest.spyOn(DateTimes, 'now').mockReturnValue('2024-02-01T00:00:00');
      const items = [
        {
          name: '감자칩',
          buyCount: 2,
          maxPromotionCount: 10,
          promotionName: '반짝할인',
        },
      ];

      // when
      const promotion = new Promotion(items);
      const result = promotion.getBuyAndGetList();

      // then
      expect(result).toEqual([
        {
          name: '감자칩',
          count: 2,
          giftCount: 0,
          isInPromotion: false,
        },
      ]);
    });
  });

  describe('추가 증정품 확인', () => {
    test('증정품을 추가로 받을 수 있는 상품 목록을 반환해야 한다', async () => {
      // given
      const items = [
        {
          name: '콜라',
          buyCount: 2,
          maxPromotionCount: 10,
          promotionName: '탄산2+1',
        },
      ];

      // when
      const promotion = new Promotion(items);
      const result = promotion.getAvailableMoreGiftList();

      // then
      expect(result).toEqual([
        {
          name: '콜라',
          canGetMoreCount: 1,
        },
      ]);
    });

    test('재고가 부족한 경우 추가 증정품을 받을 수 없다', async () => {
      // given
      const items = [
        {
          name: '콜라',
          buyCount: 2,
          maxPromotionCount: 2, // 재고가 2개뿐
          promotionName: '탄산2+1',
        },
      ];

      // when
      const promotion = new Promotion(items);
      const result = promotion.getAvailableMoreGiftList();

      // then
      expect(result).toEqual([]);
    });
  });

  describe('프로모션 관리 기능', () => {
    test('누락된 증정품을 추가할 수 있다', async () => {
      // given
      const items = [
        {
          name: '콜라',
          buyCount: 2,
          maxPromotionCount: 10,
          promotionName: '탄산2+1',
        },
      ];
      const promotion = new Promotion(items);

      // when
      promotion.manageExtraGift('콜라');
      const result = promotion.getBuyAndGetList();

      // then
      expect(result[0].giftCount).toBe(1);
    });
  });
});