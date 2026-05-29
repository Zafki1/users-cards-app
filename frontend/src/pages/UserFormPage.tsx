import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  IdCard,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../api';
import type { Card, UserFormData } from '../types';

type FormErrors = Partial<Record<string, string>>;
type Toast = { type: 'success' | 'error'; message: string };

const emptyCard: Card = {
  accountNumber: '',
  ownerNameLatin: '',
  expirationDate: '',
  cvc: ''
};

const emptyForm: UserFormData = {
  fullName: '',
  birthDate: '',
  workPlace: '',
  cards: [{ ...emptyCard }]
};

function cardHasData(card: Card) {
  return Boolean(card.accountNumber || card.ownerNameLatin || card.expirationDate || card.cvc);
}

function validateForm(form: UserFormData) {
  const errors: FormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Укажите ФИО пользователя';
  }
  if (!form.birthDate) {
    errors.birthDate = 'Укажите дату рождения';
  }

  form.cards.forEach((card, index) => {
    if (!card.accountNumber.trim()) {
      errors[`cards.${index}.accountNumber`] = 'Укажите номер счета';
    }
    if (!/^[A-Z\s.'-]+$/.test(card.ownerNameLatin.trim())) {
      errors[`cards.${index}.ownerNameLatin`] = 'Используйте только латиницу';
    }
    if (!card.expirationDate) {
      errors[`cards.${index}.expirationDate`] = 'Укажите срок действия';
    }
    if (!/^\d{3,4}$/.test(card.cvc)) {
      errors[`cards.${index}.cvc`] = 'CVC должен содержать 3 или 4 цифры';
    }
  });

  return errors;
}

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);
  const [visibleCvc, setVisibleCvc] = useState<Record<number, boolean>>({});
  const [cardToRemove, setCardToRemove] = useState<number | null>(null);

  function showToast(nextToast: Toast) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3200);
  }

  useEffect(() => {
    if (!id) {
      setForm(emptyForm);
      setErrors({});
      return;
    }

    async function loadUser() {
      try {
        setLoading(true);
        setError('');
        const user = await getUser(id!);
        setForm({
          fullName: user.fullName,
          birthDate: user.birthDate,
          workPlace: user.workPlace ?? '',
          cards: user.cards.length > 0 ? user.cards : [{ ...emptyCard }]
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить пользователя');
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  function updateField<K extends keyof UserFormData>(field: K, value: UserFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateCard(index: number, field: keyof Card, value: string) {
    setForm((current) => ({
      ...current,
      cards: current.cards.map((card, cardIndex) => (
        cardIndex === index ? { ...card, [field]: value } : card
      ))
    }));
    setErrors((current) => ({ ...current, [`cards.${index}.${field}`]: undefined }));
  }

  function addCard() {
    setForm((current) => ({
      ...current,
      cards: [...current.cards, { ...emptyCard }]
    }));
  }

  function requestRemoveCard(index: number) {
    if (form.cards.length === 1) {
      return;
    }
    if (cardHasData(form.cards[index])) {
      setCardToRemove(index);
      return;
    }
    removeCard(index);
  }

  function removeCard(index: number) {
    setForm((current) => ({
      ...current,
      cards: current.cards.filter((_, cardIndex) => cardIndex !== index)
    }));
    setCardToRemove(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast({ type: 'error', message: 'Проверьте заполнение формы' });
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (id) {
        await updateUser(id, form);
      } else {
        await createUser(form);
      }
      navigate('/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить пользователя');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel p-6 text-sm text-slate-500">Загрузка...</div>;
  }

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
          <h2 className="text-2xl font-semibold tracking-tight">
            {isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Заполните профиль и банковские карты пользователя.</p>
        </div>
        <Link to="/users" className="btn-secondary">
          <ArrowLeft size={18} aria-hidden="true" />
          Назад
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-title">
              <div className="section-icon">
                <UserRound size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Данные пользователя</h3>
                <p className="text-sm text-slate-500">Основная информация для карточки клиента.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="field md:col-span-2">
              <span>ФИО пользователя</span>
              <div className="input-shell">
                <UserRound className="input-icon" size={18} aria-hidden="true" />
                <input
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="input-field with-icon"
                  placeholder="Иванов Иван Иванович"
                  disabled={saving}
                />
              </div>
              {errors.fullName && <small>{errors.fullName}</small>}
            </label>
            <label className="field">
              <span>Дата рождения</span>
              <div className="input-shell">
                <CalendarDays className="input-icon" size={18} aria-hidden="true" />
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => updateField('birthDate', event.target.value)}
                  className="input-field with-icon"
                  disabled={saving}
                />
              </div>
              {errors.birthDate && <small>{errors.birthDate}</small>}
            </label>
            <label className="field">
              <span>Место работы</span>
              <div className="input-shell">
                <Briefcase className="input-icon" size={18} aria-hidden="true" />
                <input
                  value={form.workPlace}
                  onChange={(event) => updateField('workPlace', event.target.value)}
                  className="input-field with-icon"
                  placeholder="ООО Ромашка"
                  disabled={saving}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Банковские карты</h3>
              <p className="text-sm text-slate-500">Добавьте одну или несколько карт пользователя.</p>
            </div>
            <button type="button" onClick={addCard} className="btn-soft" disabled={saving}>
              <Plus size={18} aria-hidden="true" />
              Добавить карту
            </button>
          </div>

          {form.cards.map((card, index) => (
            <div key={index} className="form-section">
              <div className="form-section-header">
                <div className="section-title">
                  <div className="section-icon section-icon-blue">
                    <CreditCard size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Карта {index + 1}</h4>
                    <p className="text-sm text-slate-500">{card.accountNumber || 'Счет пока не заполнен'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => requestRemoveCard(index)}
                  disabled={form.cards.length === 1 || saving}
                  className="icon-button-danger"
                  title="Удалить карту"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="field">
                  <span>Номер счета</span>
                  <div className="input-shell">
                    <Hash className="input-icon" size={18} aria-hidden="true" />
                    <input
                      value={card.accountNumber}
                      onChange={(event) => updateCard(index, 'accountNumber', event.target.value)}
                      className="input-field with-icon"
                      placeholder="40817810000000000001"
                      disabled={saving}
                    />
                  </div>
                  {errors[`cards.${index}.accountNumber`] && <small>{errors[`cards.${index}.accountNumber`]}</small>}
                </label>
                <label className="field">
                  <span>ФИО владельца латиницей</span>
                  <div className="input-shell">
                    <IdCard className="input-icon" size={18} aria-hidden="true" />
                    <input
                      value={card.ownerNameLatin}
                      onChange={(event) => updateCard(index, 'ownerNameLatin', event.target.value.toUpperCase())}
                      className="input-field with-icon"
                      placeholder="IVAN IVANOV"
                      disabled={saving}
                    />
                  </div>
                  {errors[`cards.${index}.ownerNameLatin`] && <small>{errors[`cards.${index}.ownerNameLatin`]}</small>}
                </label>
                <label className="field">
                  <span>Срок действия карты</span>
                  <div className="input-shell">
                    <CalendarDays className="input-icon" size={18} aria-hidden="true" />
                    <input
                      type="date"
                      value={card.expirationDate}
                      onChange={(event) => updateCard(index, 'expirationDate', event.target.value)}
                      className="input-field with-icon"
                      disabled={saving}
                    />
                  </div>
                  {errors[`cards.${index}.expirationDate`] && <small>{errors[`cards.${index}.expirationDate`]}</small>}
                </label>
                <label className="field">
                  <span>CVC</span>
                  <div className="input-shell">
                    <ShieldCheck className="input-icon" size={18} aria-hidden="true" />
                    <input
                      maxLength={4}
                      type={visibleCvc[index] ? 'text' : 'password'}
                      value={card.cvc}
                      onChange={(event) => updateCard(index, 'cvc', event.target.value.replace(/\D/g, ''))}
                      className="input-field with-icon pr-11"
                      placeholder="123"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setVisibleCvc((current) => ({ ...current, [index]: !current[index] }))}
                      className="absolute right-2 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                      title={visibleCvc[index] ? 'Скрыть CVC' : 'Показать CVC'}
                    >
                      {visibleCvc[index] ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors[`cards.${index}.cvc`] && <small>{errors[`cards.${index}.cvc`]}</small>}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={18} aria-hidden="true" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </form>

      {cardToRemove !== null && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <h3 className="text-lg font-semibold">Удалить карту?</h3>
            <p className="mt-2 text-sm text-slate-600">Заполненные данные этой карты будут удалены из формы.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setCardToRemove(null)} className="btn-secondary">Отмена</button>
              <button type="button" onClick={() => removeCard(cardToRemove)} className="btn-danger">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

