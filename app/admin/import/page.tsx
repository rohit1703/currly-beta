'use client';

import { useState, useRef } from 'react';
import { importTools, type ImportRow, type ImportResult } from './actions';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const EXPECTED_COLUMNS = ['name', 'website', 'description', 'main_category', 'pricing_model', 'is_india_based'];

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((h, i) => {
      const val = (values[i] || '').replace(/^"|"$/g, '').trim();
      if (h === 'is_india_based') row[h] = val.toLowerCase() === 'true' || val === '1';
      else row[h] = val || undefined;
    });
    return row as ImportRow;
  }).filter(r => r.name);
}

export default function ImportPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseCSV(evt.target?.result as string);
        if (!parsed.length) setError('No valid rows found. Make sure the CSV has a header row and a "name" column.');
        else setRows(parsed);
      } catch {
        setError('Failed to parse CSV. Check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    try {
      const res = await importTools(rows);
      setResult(res);
      setRows([]);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (e: any) {
      setError(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Bulk Import Tools</h1>
      <p className="text-gray-400 text-sm mb-8">Upload a CSV to add multiple tools at once. Duplicates are skipped automatically.</p>

      {/* CSV Format Guide */}
      <div className="bg-white/5 rounded-xl border border-white/5 p-5 mb-8">
        <h2 className="text-sm font-semibold mb-3">Expected CSV Format</h2>
        <div className="font-mono text-xs text-gray-300 bg-black/30 rounded-lg p-4 overflow-x-auto">
          <div className="text-[#0066FF] mb-1">name,website,description,main_category,pricing_model,is_india_based</div>
          <div className="text-gray-400">"Replit","https://replit.com","Cloud coding platform","Coding","Freemium","false"</div>
          <div className="text-gray-400">"Pika Labs","https://pika.art","AI video generation","Video","Freemium","false"</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPECTED_COLUMNS.map(col => (
            <span key={col} className={`text-xs px-2 py-0.5 rounded-full border ${col === 'name' ? 'border-[#0066FF]/50 text-[#0066FF] bg-[#0066FF]/10' : 'border-white/10 text-gray-400'}`}>
              {col}{col === 'name' ? ' *' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-white/10 hover:border-[#0066FF]/50 rounded-xl p-10 text-center cursor-pointer transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-sm text-gray-300 mb-1">{fileName || 'Click to upload a CSV file'}</p>
        <p className="text-xs text-gray-500">Only .csv files</p>
        <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="bg-white/5 rounded-xl border border-white/5 p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Import Complete</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 bg-green-900/20 border border-green-800 rounded-xl p-4">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <div className="text-xl font-bold text-green-400">{result.imported}</div>
                <div className="text-xs text-gray-400">Tools imported</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-800 rounded-xl p-4">
              <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xl font-bold text-amber-400">{result.skipped}</div>
                <div className="text-xs text-gray-400">Skipped (duplicates)</div>
              </div>
            </div>
          </div>
          {result.skippedNames.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Skipped tools:</p>
              <div className="flex flex-wrap gap-1">
                {result.skippedNames.map(n => (
                  <span key={n} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-400">{n}</span>
                ))}
              </div>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="mt-3 text-xs text-red-400">{result.errors.join(', ')}</div>
          )}
          {result.imported > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              Embeddings will be generated automatically. Run the backfill if search feels off:
              <a href="/admin/manage" className="text-[#0066FF] hover:underline ml-1">View imported tools →</a>
            </p>
          )}
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold">{rows.length} tools ready to import</h2>
              <p className="text-xs text-gray-400 mt-0.5">Review before importing — duplicates will be skipped</p>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              {importing ? 'Importing...' : `Import ${rows.length} Tools`}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-950">
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Website</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Pricing</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">India</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-5 py-3 text-gray-200 font-medium">{r.name}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-[180px]">{r.website || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{r.main_category || 'Other'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{r.pricing_model || 'Free'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{r.is_india_based ? '🇮🇳' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
