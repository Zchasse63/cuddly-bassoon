/**
 * Transaction Service
 * Manage buyer transaction history
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { BuyerTransaction, TransactionType } from './types';

export interface CreateTransactionInput {
  property_address?: string;
  purchase_price?: number;
  sale_price?: number;
  purchase_date?: string;
  sale_date?: string;
  transaction_type?: TransactionType;
  data_source?: string;
}

export interface TransactionAnalysis {
  totalTransactions: number;
  totalPurchases: number;
  totalSales: number;
  averagePurchasePrice: number;
  averageSalePrice: number;
  totalInvested: number;
  totalProfit: number;
  purchaseFrequency: number; // per year
  firstTransaction?: string;
  lastTransaction?: string;
  preferredPropertyTypes?: string[];
  geographicPatterns?: string[];
}

export class TransactionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Add a transaction for a buyer
   */
  async addTransaction(
    buyerId: string,
    input: CreateTransactionInput
  ): Promise<BuyerTransaction> {
    const { data, error } = await this.supabase
      .from('buyer_transactions')
      .insert({
        buyer_id: buyerId,
        property_address: input.property_address || null,
        purchase_price: input.purchase_price || null,
        sale_price: input.sale_price || null,
        purchase_date: input.purchase_date || null,
        sale_date: input.sale_date || null,
        transaction_type: input.transaction_type || null,
        data_source: input.data_source || 'manual',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add transaction: ${error.message}`);
    return data as BuyerTransaction;
  }

  /**
   * Get transactions for a buyer
   */
  async getTransactions(buyerId: string): Promise<BuyerTransaction[]> {
    const { data, error } = await this.supabase
      .from('buyer_transactions')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('purchase_date', { ascending: false });

    if (error) throw new Error(`Failed to get transactions: ${error.message}`);
    return (data || []) as BuyerTransaction[];
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('buyer_transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  }

  /**
   * Analyze transaction history
   */
  async analyzeTransactions(buyerId: string): Promise<TransactionAnalysis> {
    const transactions = await this.getTransactions(buyerId);

    const purchases = transactions.filter((t) => t.transaction_type === 'purchase');
    const sales = transactions.filter((t) => t.transaction_type === 'sale');

    const totalPurchaseAmount = purchases.reduce(
      (sum, t) => sum + (t.purchase_price || 0),
      0
    );
    const totalSaleAmount = sales.reduce((sum, t) => sum + (t.sale_price || 0), 0);

    // Calculate purchase frequency
    let purchaseFrequency = 0;
    if (purchases.length > 1) {
      const dates = purchases
        .map((p) => p.purchase_date)
        .filter(Boolean)
        .map((d) => new Date(d!).getTime())
        .sort();

      if (dates.length > 1) {
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        if (firstDate !== undefined && lastDate !== undefined) {
          const timeSpan = lastDate - firstDate;
          const years = timeSpan / (365 * 24 * 60 * 60 * 1000);
          purchaseFrequency = years > 0 ? purchases.length / years : purchases.length;
        }
      }
    }

    // Get date range
    const allDates = transactions
      .flatMap((t) => [t.purchase_date, t.sale_date])
      .filter(Boolean)
      .map((d) => new Date(d!))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      totalTransactions: transactions.length,
      totalPurchases: purchases.length,
      totalSales: sales.length,
      averagePurchasePrice: purchases.length > 0 ? totalPurchaseAmount / purchases.length : 0,
      averageSalePrice: sales.length > 0 ? totalSaleAmount / sales.length : 0,
      totalInvested: totalPurchaseAmount,
      totalProfit: totalSaleAmount - totalPurchaseAmount,
      purchaseFrequency: Math.round(purchaseFrequency * 10) / 10,
      firstTransaction: allDates[0]?.toISOString(),
      lastTransaction: allDates[allDates.length - 1]?.toISOString(),
    };
  }

  /**
   * Import transactions from CSV data
   */
  async importFromCSV(
    buyerId: string,
    csvData: CreateTransactionInput[]
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        if (row) {
          await this.addTransaction(buyerId, row);
          imported++;
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, errors };
  }
}

