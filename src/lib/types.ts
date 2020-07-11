export namespace SBanken {
  export interface ClientOptions {
    baseUrlApi?: string,
    baseUrlAuth?: string,
    applicationId: string,
    applicationSecret: string,
    customerId: string
  }
  /**
   * The `accountId` for an account you got from `.getAccounts()`
   */
  export type AccountID = string

  export interface TokenAPIData {
    access_token: string,
    expires_in: number,
    expires?: number,
    token_type: string,
    scope: [
      'Exec.Bank.Accounts.read_access',
      'Exec.Bank.Cards.read_access',
      'Exec.Bank.EFakturas.full_access',
      'Exec.Bank.Payments.read_access',
      'Exec.Bank.StandingOrders.read_access',
      'Exec.Bank.Transactions.read_access',
      'Exec.Bank.Transfers.full_access',
      'Exec.Customers.Customers.read_access'
    ]
  }

  export interface APIAccounts {
    availableItems: number
    items: Account[]
    errorType?: string
    isError: boolean
    errorCode?: number
    errorMessage?: string
    traceId?: string
  }

  export interface APIAccount {
    accountId: string
    accountNumber: string
    ownerCustomerId: string
    name: string
    accountType: string
    available: number
    balance: number
    creditLimit: number
  }
}
