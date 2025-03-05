import throwError from './throwError.js';
import * as e from '../constants/error.js';

export function validatePurchase(purchase) {
  const purchaseList = [];
  if (purchase.trim() === '') throwError(e.INVALID_FORMAT);

  purchase = purchase.split(',').map((element) => element);
  purchase.forEach((element) => {
    if (element[0] !== '[' || element[element.length - 1] !== ']') throwError(e.INVALID_FORMAT);
    purchaseList.push(validateEachPurchase(element));
  });

  return purchaseList;
}

export function validateYNAnswer(answer) {
  answer = answer;
  if (answer !== 'Y' && answer !== 'N') throwError(e.INVALID_INPUT);
  return answer;
}

function validateEachPurchase(element) {
  element = element.slice(1, element.length - 1).split('-');
  if (element.length !== 2) throwError(e.INVALID_FORMAT);
  if (!isInteger(element[1])) throwError(e.INVALID_FORMAT);

  return { name: element[0], count: Number(element[1]) };
}

function isInteger(value) {
  if (isNaN(value)) return false;

  const number = Number(value);
  const integer = parseInt(value);
  if (number !== integer) return false;
  return true;
}