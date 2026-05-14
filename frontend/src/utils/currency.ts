export const CURRENCY_CHOICES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'AFN', label: 'Afghan Afghani (؋)', symbol: '؋' },
];

export const getCurrencySymbol = (currencyCode: string): string => {
  return currencyCode === 'AFN' ? '؋' : '$';
};