'use client';

import { useState } from 'react';

export default function TestFormPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/debug-action', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Form Checkbox</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isRegistrationClosed" value="on" defaultChecked />
            <span className="text-lg">Tutup Pendaftaran?</span>
          </label>
        </div>
        
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
