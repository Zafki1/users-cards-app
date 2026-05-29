import {
  Briefcase,
  Calendar,
  CreditCard,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUser, getUsers } from '../api';
import type { User } from '../types';

type SortKey = 'fullName' | 'birthDate' | 'cardsCount';
type Toast = { type: 'success' | 'error'; message: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

function maskAccount(value: string) {
  if (value.length <= 8) {
    return value.replace(/.(?=.{4})/g, '*');
  }
  return `${value.slice(0, 6)}******${value.slice(-4)}`;
}

function maskCvc(value: string) {
  return '*'.repeat(value.length || 3);
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fullName');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(nextToast: Toast) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3200);
  }

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteUser(deleteTarget.id);
      setUsers((current) => current.filter((item) => item.id !== deleteTarget.id));
      showToast({ type: 'success', message: 'Пользователь удален' });
      setDeleteTarget(null);
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Не удалось удалить пользователя'
      });
    }
  }

  async function openDetails(user: User) {
    try {
      setDetailsLoading(true);
      setDetailsUser(user);
      setDetailsUser(await getUser(String(user.id)));
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Не удалось открыть карточку пользователя'
      });
      setDetailsUser(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users
      .filter((user) => user.fullName.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        if (sortKey === 'birthDate') {
          return left.birthDate.localeCompare(right.birthDate);
        }
        if (sortKey === 'cardsCount') {
          return (right.cardsCount ?? 0) - (left.cardsCount ?? 0);
        }
        return left.fullName.localeCompare(right.fullName, 'ru');
      });
  }, [query, sortKey, users]);

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <section className="space-y-6">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Список пользователей</h2>
          <p className="mt-1 text-sm text-slate-500">Управление пользователями и привязанными картами.</p>
        </div>
        <Link to="/users/new" className="btn-primary">
          <Plus size={18} aria-hidden="true" />
          Новый пользователь
        </Link>
      </div>

      <div className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block md:w-96">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по ФИО"
            className="input-field pl-10"
          />
        </label>
        <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="input-field md:w-64">
          <option value="fullName">Сортировка: ФИО</option>
          <option value="birthDate">Сортировка: дата рождения</option>
          <option value="cardsCount">Сортировка: количество карт</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="panel hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="table-head">ФИО</th>
                <th className="table-head">Дата рождения</th>
                <th className="table-head">Место работы</th>
                <th className="table-head">Карты</th>
                <th className="table-head w-44 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>Загрузка...</td>
                </tr>
              )}
              {!loading && visibleUsers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>Пользователи не найдены.</td>
                </tr>
              )}
              {!loading && visibleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium">{user.fullName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(user.birthDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.workPlace || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.cardsCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => void openDetails(user)} className="icon-button" title="Просмотр">
                        <Eye size={17} aria-hidden="true" />
                      </button>
                      <Link to={`/users/${user.id}/edit`} className="icon-button" title="Редактировать">
                        <Edit size={17} aria-hidden="true" />
                      </Link>
                      <button type="button" onClick={() => setDeleteTarget(user)} className="icon-button-danger" title="Удалить">
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {loading && <div className="panel p-5 text-sm text-slate-500">Загрузка...</div>}
        {!loading && visibleUsers.length === 0 && <div className="panel p-5 text-sm text-slate-500">Пользователи не найдены.</div>}
        {!loading && visibleUsers.map((user) => (
          <article key={user.id} className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{user.fullName}</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Calendar size={15} />{formatDate(user.birthDate)}</div>
                  <div className="flex items-center gap-2"><Briefcase size={15} />{user.workPlace || '-'}</div>
                  <div className="flex items-center gap-2"><CreditCard size={15} />Карт: {user.cardsCount ?? 0}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void openDetails(user)} className="icon-button" title="Просмотр">
                  <Eye size={17} />
                </button>
                <Link to={`/users/${user.id}/edit`} className="icon-button" title="Редактировать">
                  <Edit size={17} />
                </Link>
                <button type="button" onClick={() => setDeleteTarget(user)} className="icon-button-danger" title="Удалить">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <h3 className="text-lg font-semibold">Удалить пользователя?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Пользователь «{deleteTarget.fullName}» и все его карты будут удалены из базы данных.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="btn-secondary">Отмена</button>
              <button type="button" onClick={() => void confirmDelete()} className="btn-danger">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {detailsUser && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{detailsUser.fullName}</h3>
                <p className="mt-1 text-sm text-slate-500">{detailsUser.workPlace || 'Место работы не указано'}</p>
              </div>
              <button type="button" onClick={() => setDetailsUser(null)} className="btn-secondary">Закрыть</button>
            </div>
            {detailsLoading ? (
              <div className="mt-6 text-sm text-slate-500">Загрузка...</div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="detail-tile">
                    <span>Дата рождения</span>
                    <strong>{formatDate(detailsUser.birthDate)}</strong>
                  </div>
                  <div className="detail-tile">
                    <span>Количество карт</span>
                    <strong>{detailsUser.cards?.length ?? detailsUser.cardsCount ?? 0}</strong>
                  </div>
                </div>
                <div className="space-y-3">
                  {(detailsUser.cards ?? []).map((card, index) => (
                    <div key={card.id ?? index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <strong>Карта {index + 1}</strong>
                        <span className="text-sm text-slate-500">до {formatDate(card.expirationDate)}</span>
                      </div>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div><span className="text-slate-500">Счет:</span> {maskAccount(card.accountNumber)}</div>
                        <div><span className="text-slate-500">Владелец:</span> {card.ownerNameLatin}</div>
                        <div><span className="text-slate-500">CVC:</span> {maskCvc(card.cvc)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
