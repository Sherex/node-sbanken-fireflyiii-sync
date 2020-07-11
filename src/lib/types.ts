export interface ClientParamOptions {
  baseUrlApi?: string
  baseUrlAuth?: string
  applicationId: string
  applicationSecret: string
  customerId: string
}

export interface ClientOptionsData extends ClientParamOptions {
  baseUrlApi: string
  baseUrlAuth: string
}

export function isClientOptionsData (options: ClientParamOptions): options is ClientOptionsData {
  if (typeof options.baseUrlApi !== 'string') return false
  if (typeof options.baseUrlAuth !== 'string') return false
  return true
}

/**
 * The `accountId` for an account you got from `.getAccounts()`
 */
export type AccountID = string

export interface TokenAPIResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface TokenData extends TokenAPIResponse {
  expires: number
  scopes: [
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
  items: APIAccount[]
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
