import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import { TransformedTransaction, GroupedTransactionsByBank, GroupedTransactionsByCategory } from "@/utils/types";
import { categoryIconMap } from './constants';

export async function restartApp() {
  try {
    await Updates.reloadAsync() // This will reload the app
  } catch (error) {
    console.error('Error restarting the app', error)
  }
}

export function generateTimestampedFilename(prefix: string, extension: string): string {
  const now = new Date()
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `${prefix}_${timestamp}.${extension}`
}

export function getCurrentMonthYear(monthInteger: boolean = false) {
  const now = new Date()
  const month = monthInteger ? (now.getMonth() + 1) : now.toLocaleString('en-US', { month: 'long' })
  const year = now.getFullYear()
  return { month, year }
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' }); // Short month name (e.g., "Jan")
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' }); // Abbreviated weekday (e.g., "Sun")

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, '0');

  return `${month} ${day} / ${dayOfWeek} - ${formattedHours}:${minutes}${ampm}`;
}

export const formatDateToISO = (date: Date) => {
  const pad = (num: number) => (num < 10 ? '0' : '') + num
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const formatAmount = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export async function listFilesInDocumentDirectory() {
  const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  console.log('Files in SQLite directory:', files);
}

export async function checkFileExistsAndRead() {
  const filePath = FileSystem.documentDirectory + 'SQLite/user.db';

  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    console.log('File exists:', filePath);
    console.log('File details:', fileInfo);
  } else {
    console.log('File does not exist:', filePath);
  }
}

export const groupTransactionsByBank = (transactions: TransformedTransaction[]) => {
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const { bank, amount, transaction_type } = transaction;
    const { id, bank_name, logo_url } = bank;

    if (!acc[id]) {
      acc[id] = {
        bank_id: id,
        bank_name,
        logo_url,
        expenseAmount: 0,
        incomeAmount: 0,
        transactions: [],
      };
    }

    acc[id].transactions.push(transaction);

    if (transaction_type === "Expense") {
      acc[id].expenseAmount += amount;
    } else if (transaction_type === "Income") {
      acc[id].incomeAmount += amount;
    }

    return acc;
  }, {} as Record<number, GroupedTransactionsByBank>);

  return Object.values(groupedTransactions);
};

export const groupTransactionsByCategory = (transactions: TransformedTransaction[]) => {
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const { category, amount, transaction_type } = transaction;
    const { category_id, category_name, category_type } = category;

    if (!acc[category_id]) {
      acc[category_id] = {
        category_id,
        category_name,
        category_type,
        expenseAmount: 0,
        incomeAmount: 0,
        transactions: [],
      };
    }

    acc[category_id].transactions.push(transaction);

    if (transaction_type === "Expense") {
      acc[category_id].expenseAmount! += amount;
    } else if (transaction_type === "Income") {
      acc[category_id].incomeAmount! += amount;
    }

    return acc;
  }, {} as Record<number, GroupedTransactionsByCategory>);

  return Object.values(groupedTransactions);
};

export const getCategoryIcon = (categoryName: string): any => {
  return categoryIconMap[categoryName] || 'category';
};