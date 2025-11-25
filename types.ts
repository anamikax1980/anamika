export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  currentLoanPrincipal: number;
  totalSavings: number;
  joinedDate: string;
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  LOAN_TAKEN = 'LoanTaken',
  LOAN_REPAYMENT = 'LoanRepayment',
  INTEREST_PAID = 'InterestPaid'
}

export interface Transaction {
  id: string;
  memberId: string;
  date: string;
  type: TransactionType;
  amount: number;
  note?: string;
}

export interface AppSettings {
  interestRate: number; // Percentage
  monthlySavingsAmount: number;
}
