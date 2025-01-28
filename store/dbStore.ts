import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import {
	TransformedTransaction,
	TransactionsSummary,
	TransactionsViewType,
} from "@/utils/types";
import { DEFAULT_DB_PATH } from "@/utils/constants";

type DBStore = {
	dbExists: boolean;
	dbPath: string | null;
	currentTransactions: TransformedTransaction[];
	transactionsSummary: TransactionsSummary;
	viewType: TransactionsViewType;
  totalTransactions: number;
	updateDBState: () => Promise<void>;
	setDBExists: (exists: boolean) => void;
	setCurrentTransactions: (transactions: TransformedTransaction[]) => void;
	setTransactionsSummary: (summary: TransactionsSummary) => void;
	setViewType: (viewType: TransactionsViewType) => void;
  setTotalTransactions: (total: number) => void;
	resetState: () => void;
	deleteDB: () => Promise<void>;
};

export const useDBStore = create<DBStore>()(
	persist(
		(set, get) => ({
			dbExists: false,
			dbPath: null,
			currentTransactions: [],
			transactionsSummary: {
				totalExpenses: {
					cop: 0,
					usd: 0,
				},
				totalIncome: {
					cop: 0,
					usd: 0,
				},
			},
			viewType: "default",
      totalTransactions: 0,

			updateDBState: async () => {
				try {
					const fileInfo = await FileSystem.getInfoAsync(DEFAULT_DB_PATH);

					set({
						dbExists: fileInfo.exists,
						dbPath: fileInfo.exists ? DEFAULT_DB_PATH : null,
					});
				} catch (error) {
					console.error("Error updating database state:", error);
					set({ dbExists: false, dbPath: null });
				}
			},

			setDBExists: (exists: boolean) => {
				set({
					dbExists: exists,
					dbPath: exists ? DEFAULT_DB_PATH : null,
				});
			},

			setCurrentTransactions: (transactions: TransformedTransaction[]) => {
				set({ currentTransactions: transactions });
			},

			setTransactionsSummary: (summary: TransactionsSummary) => {
				set({ transactionsSummary: summary });
			},

			setViewType: (viewType: TransactionsViewType) => {
				set({ viewType });
			},

      setTotalTransactions: (total) => set({ totalTransactions: total }),

			resetState: () => {
				set({
					dbExists: false,
					dbPath: null,
					currentTransactions: [],
					transactionsSummary: {
						totalExpenses: {
							cop: 0,
							usd: 0,
						},
						totalIncome: {
							cop: 0,
							usd: 0,
						},
					},
					viewType: "default",
          totalTransactions: 0,
				});
			},

			deleteDB: async () => {
				const { dbPath } = get();

				if (!dbPath) {
					console.warn("No database path set. Skipping deletion.");
					return;
				}

				try {
					const db = await SQLite.openDatabaseAsync(dbPath);
					await db.closeAsync();
					await FileSystem.deleteAsync(dbPath);

					get().resetState();
				} catch (error) {
					console.error("Error deleting database:", error);
				}
			},
		}),
		{
			name: "db-store", // Storage key for persisted state
			storage: {
				getItem: async (key) => {
					const value = await AsyncStorage.getItem(key);
					return value ? JSON.parse(value) : null;
				},
				setItem: async (key, value) => {
					await AsyncStorage.setItem(key, JSON.stringify(value));
				},
				removeItem: async (key) => {
					await AsyncStorage.removeItem(key);
				},
			},
		},
	),
);
