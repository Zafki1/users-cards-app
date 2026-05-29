import { CreditCard } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <CreditCard size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Пользователи и банковские карты</h1>
            <p className="text-sm text-slate-500">Управление клиентскими данными</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

