/**
 * Utility helpers
 */

// Format a number as South African Rands
// e.g. 12500 → "R 12,500"
export function formatZAR(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'R 0';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Format as a short ZAR (e.g. R 1.2M, R 450k)
export function formatZARShort(amount) {
  if (Math.abs(amount) >= 1_000_000) return `R ${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `R ${(amount / 1_000).toFixed(0)}k`;
  return formatZAR(amount);
}

// Clamp a number between min and max
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Future Value of a lump sum + monthly contributions
// FV = P*(1+r)^n + PMT * [((1+r)^n - 1) / r]
export function futureValue(principal, monthlyContrib, annualRate, years) {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal + monthlyContrib * n;
  const lump = principal * Math.pow(1 + r, n);
  const contrib = monthlyContrib * ((Math.pow(1 + r, n) - 1) / r);
  return lump + contrib;
}

// Simple compound interest (annual compounding)
export function compoundAnnual(principal, annualRate, years) {
  return principal * Math.pow(1 + annualRate, years);
}

// Total cost of a loan (principal + interest)
export function totalLoanCost(principal, annualRate, months) {
  if (annualRate === 0) return principal;
  const r = annualRate / 12;
  const payment = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return payment * months;
}

// Monthly bond/loan repayment
export function monthlyRepayment(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
