// backend/src/utils/csvParser.ts
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export interface ParsedTransaction {
  transactionCode: string;
  transactionDate: Date;
  merchantName: string;
  amount: number;
  transactionType: string; // DEBIT | CREDIT | WITHDRAW
  rawDescription: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
}

// M-Pesa CSV typically has columns:
// Receipt No., Completion Time, Details, Transaction Status, Paid In, Withdrawn, Balance
const normalizeAmount = (val: string): number => {
  if (!val) return 0;
  return parseFloat(val.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
};

const parseDate = (val: string): Date | null => {
  if (!val) return null;
  // Support: "1/1/2024 12:00:00 AM" or "2024-01-01T12:00:00"
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const inferType = (paidIn: string, withdrawn: string, details: string): string => {
  const d = details.toLowerCase();
  if (d.includes('withdraw') || d.includes('agent')) return 'WITHDRAW';
  const pIn = normalizeAmount(paidIn);
  const wOut = normalizeAmount(withdrawn);
  if (pIn > 0 && wOut === 0) return 'CREDIT';
  return 'DEBIT';
};

const extractMerchant = (details: string): string => {
  if (!details) return 'Unknown';
  // Remove common M-Pesa prefixes
  const cleaned = details
    .replace(/^Customer Transfer to /i, '')
    .replace(/^Payment to /i, '')
    .replace(/^Send Money -/i, '')
    .replace(/^Pay Bill Online -/i, '')
    .replace(/^Buy Goods -/i, '')
    .trim();
  // Take first meaningful segment
  const parts = cleaned.split(' - ');
  return parts[0].trim().substring(0, 100);
};

export const parseMpesaCsv = (buffer: Buffer): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const results: ParsedTransaction[] = [];
    const errors: string[] = [];
    const seen = new Set<string>();
    let rowIndex = 0;

    const stream = Readable.from(buffer);

    stream.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      })
    ).on('data', (row: Record<string, string>) => {
      rowIndex++;
      try {
        // Try to map common M-Pesa CSV column names
        const code =
          row['Receipt No.'] || row['Transaction ID'] || row['receipt_no'] || `GEN-${rowIndex}`;
        const dateRaw =
          row['Completion Time'] || row['Date'] || row['transaction_date'] || '';
        const details =
          row['Details'] || row['Description'] || row['details'] || '';
        const paidIn = row['Paid In'] || row['Credit'] || row['paid_in'] || '0';
        const withdrawn = row['Withdrawn'] || row['Debit'] || row['withdrawn'] || '0';

        if (!code || !dateRaw) {
          errors.push(`Row ${rowIndex}: missing required fields`);
          return;
        }

        if (seen.has(code)) {
          errors.push(`Row ${rowIndex}: duplicate receipt ${code}`);
          return;
        }

        const date = parseDate(dateRaw);
        if (!date) {
          errors.push(`Row ${rowIndex}: invalid date "${dateRaw}"`);
          return;
        }

        const pIn = normalizeAmount(paidIn);
        const wOut = normalizeAmount(withdrawn);
        const amount = pIn > 0 ? pIn : wOut;

        if (amount === 0) {
          errors.push(`Row ${rowIndex}: zero-amount transaction skipped`);
          return;
        }

        seen.add(code);
        results.push({
          transactionCode: code,
          transactionDate: date,
          merchantName: extractMerchant(details),
          amount,
          transactionType: inferType(paidIn, withdrawn, details),
          rawDescription: details.substring(0, 500),
        });
      } catch (e) {
        errors.push(`Row ${rowIndex}: parse error — ${(e as Error).message}`);
      }
    })
    .on('end', () => resolve({ transactions: results, errors }))
    .on('error', (err) => {
      errors.push(`CSV parse failed: ${err.message}`);
      resolve({ transactions: results, errors });
    });
  });
};