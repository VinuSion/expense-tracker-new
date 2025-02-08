import * as FileSystem from "expo-file-system";

export const DB_NAME = "user.db";
export const DEFAULT_DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
export const LATEST_SCHEMA_VERSION = 1;

export const EST_TIMEZONE = "America/New_York";

export const databaseDefinition = [
	`CREATE TABLE IF NOT EXISTS schema_version (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_number TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
	`CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
	`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL,
    category_type TEXT NOT NULL CHECK(category_type IN ('Expense', 'Income')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
	`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id INTEGER NOT NULL,
    budget_amount REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bank_id) REFERENCES banks(id)
  )`,
	`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK(currency IN ('COP', 'USD')),
    transaction_date DATE NOT NULL,
    transaction_description TEXT,
    category_id INTEGER,
    bank_id INTEGER,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Expense', 'Income')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    FOREIGN KEY (bank_id) REFERENCES banks (id) ON DELETE SET NULL
  )`,
	`CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_amount REAL NOT NULL,
    currency TEXT NOT NULL CHECK(currency IN ('COP', 'USD')),
    transfer_date DATE NOT NULL,
    source_bank_id INTEGER NOT NULL,
    dest_bank_id INTEGER NOT NULL,
    currency_exchange BOOLEAN NOT NULL DEFAULT FALSE,
    origin_amount REAL,
    origin_currency TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
	`PRAGMA foreign_keys = ON`,
];

export const insertStatements = [
  `INSERT INTO schema_version (version_number) VALUES ('${LATEST_SCHEMA_VERSION}')`,
	`INSERT INTO banks (bank_name, logo_url) VALUES 
    ('Bancolombia', 'https://res.cloudinary.com/stkv2/image/upload/v1735163181/banks/bwbo3c6g1qsjistcgmgq.png'),
    ('BBVA', 'https://res.cloudinary.com/stkv2/image/upload/v1736112133/banks/vvvkpz2oxgzkrygile0r.png'),
    ('Bogota', 'https://res.cloudinary.com/stkv2/image/upload/v1736112133/banks/nppltf8dgg4tvfjkqiyj.png'),
    ('Cash', 'https://res.cloudinary.com/stkv2/image/upload/v1735163181/banks/hpb1twaaan4sb5kxupz2.png'),
    ('Davivienda', 'https://res.cloudinary.com/stkv2/image/upload/v1736112125/banks/byaysih3bfmhyveasyrg.png'),
    ('Global66', 'https://res.cloudinary.com/stkv2/image/upload/v1735163181/banks/eibkudsc6prz4du3jzxn.png'),
    ('Nequi', 'https://res.cloudinary.com/stkv2/image/upload/v1735163181/banks/wxbpieywd8xo9ynhgcbt.png'),
    ('NuBank', 'https://res.cloudinary.com/stkv2/image/upload/v1735163181/banks/zitxlmfeongnfm0kejss.png')`,
	`INSERT INTO categories (category_name, category_type) VALUES
    ('Food', 'Expense'),
    ('Clothes', 'Expense'),
    ('House Bills', 'Expense'),
    ('Debt Repayments', 'Expense'),
    ('Self Hygiene', 'Expense'),
    ('Health', 'Expense'),
    ('Transport', 'Expense'),
    ('Taxes', 'Expense'),
    ('Subscriptions', 'Expense'),
    ('Tech', 'Expense'),
    ('Utilities', 'Expense'),
    ('Other', 'Expense'),
    ('Salary', 'Income'),
    ('Investments', 'Income'),
    ('Freelance Work', 'Income'),
    ('Sales', 'Income'),
    ('Gifts', 'Income'),
    ('Refunds', 'Income'),
    ('Miscellaneous', 'Income')`,
];

export const viewOptions = [
	{ value: "default", title: "Default", icon: "reorder" },
	{ value: "bankGrouped", title: "Bank", icon: "savings" },
	{ value: "categoryGrouped", title: "Category", icon: "category" },
];

export const categoryIconMap: Record<string, string> = {
	Food: "restaurant", // Icon for restaurants or meals
	Clothes: "local-mall", // Icon for shopping, clothes
	"House Bills": "receipt-long", // Icon for home bills, housing
	"Debt Repayments": "credit-card", // Icon for debt or credit card payments
	"Self Hygiene": "spa", // Icon for self-care, hygiene
	Health: "health-and-safety", // Icon for self-care, hygiene
	Transport: "commute", // Icon for cars, transport
	Taxes: "account-balance", // Icon for taxes or government payments
	Subscriptions: "subscriptions", // Icon for subscriptions like Netflix, Spotify, etc.
	Tech: "devices", // Icon for technology items
	Utilities: "archive", // Icon for electricity or utilities
	Other: "workspaces", // Icon for other miscellaneous expenses
	Salary: "work", // Icon for salary or income
	Investments: "trending-up", // Icon for investments
	"Freelance Work": "work-outline", // Icon for freelance work
	Sales: "store", // Icon for freelance work
	Gifts: "card-giftcard", // Icon for gifts or presents
	Refunds: "money-off", // Icon for refunds or money back
	Miscellaneous: "category", // Icon for miscellaneous items or general use
};
