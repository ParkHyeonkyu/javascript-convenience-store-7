export function nullFormatter(string) {
    if (string === 'null') return null;
    return string;
  }
  
  export function toPrintInfo(product) {
    let info = `- ${product.name} ${thousandComma(product.price)}원`;
  
    if (product.quantity === 0) info += ' 재고 없음';
    else info += ` ${product.quantity}개`;
  
    if (product.promotion === null) return info;
  
    info += ` ${product.promotion}`;
    return info;
  }
  
  /**
   * DateTimes.now()에서 날짜만 파싱
   * @returns yyyy-mm-dd
   */
  export function parseDateTime(value) {
    const date = JSON.stringify(value).replace('"', '').split('T');
    return date[0];
  }
  
  export function thousandComma(string) {
    return string.toLocaleString('ko-kr');
  }