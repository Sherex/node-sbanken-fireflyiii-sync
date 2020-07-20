import { components as FireflyRaw } from './firefly-api'

export type Schemas = FireflyRaw['schemas']

export type Account = Schemas['AccountRead']
export type Transaction = Schemas['TransactionRead']
export type Currency = Schemas['CurrencyRead']
export type User = Schemas['UserRead']

export type AccountCreate = Schemas['Account']
export type CurrencyCreate = Schemas['Currency']
export type TransactionCreate = Schemas['Transaction']
export type TransactionCreate2 = TransactionCreateInterface

interface TransactionCreateInterface {
  error_if_duplicate_hash?: boolean
  apply_rules?: boolean
  group_title?: string
  transactions: Transactions[]
}

interface Transactions {
  type?: [ 'withdrawal', 'deposit', 'transfer', 'reconciliation' ]
  date: string
  amount: string
  description: string
  order?: number
  currency_id?: number
  currency_code?: string
  foreign_amount?: string
  foreign_currency_id?: number
  foreign_currency_code?: string
  budget_id?: number
  category_id?: number
  category_name?: string
  source_id: number
  source_name?: string
  destination_id: number
  destination_name?: string
  reconciled?: boolean
  piggy_bank_id?: number
  piggy_bank_name?: string
  bill_id?: number
  bill_name?: string
  tags?: string
  notes?: string
  internal_reference?: string
  external_id?: string
  bunq_payment_id?: string
  sepa_cc?: string
  sepa_ct_op?: string
  sepa_ct_id?: string
  sepa_db?: string
  sepa_country?: string
  sepa_ep?: string
  sepa_ci?: string
  sepa_batch_id?: string
  interest_date?: string
  book_date?: string
  process_date?: string
  due_date?: string
  payment_date?: string
  invoice_date?: string
}
