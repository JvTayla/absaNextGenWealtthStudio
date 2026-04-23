/**
 * UserProfileContext
// holds all the user's financial info so any page can grab it
// without me having to pass props everywhere (learned this the hard way) :(
// had to look up how SARS brackets work, this took a while to get right
// UIF is capped at a monthly ceiling - forgot this at first and numbers were wrong
 */

import { createContext, useContext, useState } from "react";

//   South African SARS Tax Brackets (2024/25 tax year)  
// These are the real SARS brackets — we use these to estimate PAYE
export const SARS_BRACKETS = [
  { min: 0, max: 237100, base: 0, rate: 0.18 },
  { min: 237101, max: 370500, base: 42678, rate: 0.26 },
  { min: 370501, max: 512800, base: 77362, rate: 0.31 },
  { min: 512801, max: 673000, base: 121475, rate: 0.36 },
  { min: 673001, max: 857900, base: 179147, rate: 0.39 },
  { min: 857901, max: 1817000, base: 251258, rate: 0.41 },
  { min: 1817001, max: Infinity, base: 644489, rate: 0.45 },
];

const PRIMARY_REBATE = 17235; // 2024/25 — update when 2025/26 confirmed by SARS
const UIF_RATE = 0.01; // 1% up to ceiling
const UIF_CEILING = 17712; // monthly ceiling

export function calcTax(grossMonthly) {
  const annual = grossMonthly * 12;
  const bracket = SARS_BRACKETS.find((b) => annual >= b.min && annual <= b.max);
  if (!bracket) return 0;
  const annualTax =
    bracket.base + (annual - bracket.min) * bracket.rate - PRIMARY_REBATE;
  const uif = Math.min(grossMonthly, UIF_CEILING) * UIF_RATE;
  return Math.max(0, annualTax / 12) + uif;
}

// Default user profile to test Website Layout
const defaultProfile = {
  // Personal
  name: "Lebo",
  age: 27,
  location: "Cape Town",

  // Financial inputs (Money Snapshot)
  grossMonthly: 68000,
  fixedCosts: {
    rent: 14000,
    medicalAid: 1800,
    insurance: 800,
    studentLoan: 3000,
    subscriptions: 800,
  },
  variableSpending: {
    groceries: 3500,
    diningOut: 4000,
    transport: 3500,
    entertainment: 2500,
    shopping: 3000,
  },
  savings: {
    emergencyFund: 45000,
    tfsa: 12000,
    ra: 0,
    offshore: 0,
    localInvestments: 28000,
  },

  // Vision / Goal
  selectedTrack: "global-citizen",
  primaryGoal: {
    name: "Offshore Portfolio Target",
    target: 500000,
    current: 40000,
    timelineYears: 5,
  },

  // Risk
  riskTolerance: "moderate", // conservative | moderate | aggressive
};

//   Create the Context  
const UserProfileContext = createContext(null);

//   Provider component (wraps the whole app)  
export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);

  // Update a top-level field (e.g. grossMonthly)
  function updateProfile(updates) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  // Update a nested field (e.g. fixedCosts.rent)
  function updateNested(section, key, value) {
    setProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  // Derived calculations (computed from profile data)
  const monthlyTax = calcTax(profile.grossMonthly);
  const takeHome = profile.grossMonthly - monthlyTax;

  const totalFixed = Object.values(profile.fixedCosts).reduce(
    (s, v) => s + v,
    0,
  );
  const totalVariable = Object.values(profile.variableSpending).reduce(
    (s, v) => s + v,
    0,
  );
  const totalSpending = totalFixed + totalVariable;
  const disposable = takeHome - totalSpending;

  const goalProgress = Math.min(
    100,
    Math.round(
      (profile.primaryGoal.current / profile.primaryGoal.target) * 100,
    ),
  );

  const totalSavings = Object.values(profile.savings).reduce(
    (s, v) => s + v,
    0,
  );

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateNested,
        // Derived
        monthlyTax,
        takeHome,
        totalFixed,
        totalVariable,
        totalSpending,
        disposable,
        goalProgress,
        totalSavings,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

//   Custom hook for easy access  
export function useProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error("useProfile must be used inside UserProfileProvider");
  return ctx;
}
