// src/pages/Settings/Profile.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Mail, Phone, Calendar,
  Shield, Bell, CreditCard,
  Edit3, Check, X, Upload, Award,
  AlertTriangle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { formatDate } from '@/hooks/use-format';
import { clearError, modifyUserProfile, removeAccount } from '@/store/slices/userSlices/user.slice';
import { Link, useNavigate } from 'react-router-dom';
import { getProfilePicUrl } from '@/utils/profile.util';

type EditableField = 'full_name' | 'phone' | 'email' | null;

function EditableRow({
  icon: Icon,
  label,
  value,
  placeholder,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  placeholder: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 group border-b border-border/50 dark:border-slate-700 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-hover flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted font-medium mb-0.5">{label}</p>
        {isEditing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm text-text bg-hover border border-accent/40 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent transition-colors"
          />
        ) : (
          <p className="text-sm text-text truncate">
            {value || <span className="text-muted italic">{placeholder}</span>}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
            >
              <Check size={13} />
            </button>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-text transition-colors"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-hover text-muted hover:text-text transition-all"
          >
            <Edit3 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── SecurityRow ───────────────────────────────────────────────────────────────

function SecurityRow({
  icon: Icon,
  iconColor,
  label,
  isActive = true,
  sub,
  subColor,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  isActive?: boolean;
  sub: string;
  subColor?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-hover flex items-center justify-center flex-shrink-0">
          <Icon size={15} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className={`text-xs ${subColor ?? 'text-muted'}`}>{sub}</p>
        </div>
      </div>

      <button
        onClick={onAction}
        className={`text-xs font-semibold ${isActive? 'text-violet-500 hover:underline':'text-[#bbbaba]'}`}
      >
        {isActive ? actionLabel : <span className='text-slate-400 dark:text-slate-600 cursor-not-allowed'>Unavailable</span>}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, error, loading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    profilePic: user?.profilePic ?? null as string | null,
    created_at: user?.created_at ?? '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        profilePic: user.profilePic ?? null,
        created_at: user.created_at ?? '',
      });
    }
  }, [user]);

  const [editing, setEditing] = useState<EditableField>(null);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [displayConfirmBox, setDisplayConfirmBox] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [dropLoading, setDropLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const initials = form.full_name
    ? form.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // ── Handlers ──────────────────────────────────────────────────────────────

  function startEdit(field: EditableField) {
    dispatch(clearError());
    setFieldError(null);
    setEditing(field);
    setDraft(form[field as keyof typeof form] as string ?? '');
  }

  async function saveEdit() {
    if (!editing || !draft.trim()) {
      setFieldError('Field cannot be empty');
      return;
    }

    if (editing === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft)) {
      setFieldError('Invalid email address');
      return;
    }

    if (editing === 'phone' && !/^[0-9]{10,15}$/.test(draft)) {
      setFieldError('Invalid phone number');
      return;
    }

    if (editing === 'full_name' && draft.trim().length < 2) {
      setFieldError('Name must be at least 2 characters');
      return;
    }

    const formData = new FormData();
    formData.append(editing, draft.trim());

    const result = await dispatch(modifyUserProfile(formData));

    if (modifyUserProfile.fulfilled.match(result)) {
      setEditing(null);
      setFieldError(null);
      flashSaved();
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, profilePic: localUrl }));

    const formData = new FormData();
    formData.append('profilePic', file);

    const result = await dispatch(modifyUserProfile(formData));
    if (!modifyUserProfile.fulfilled.match(result)) {
      setForm((prev) => ({ ...prev, profilePic: user?.profilePic ?? null }));
    } else {
      flashSaved();
    }
  }

  function cancelEdit() {
    setEditing(null);
    setDraft('');
    setFieldError(null);
    dispatch(clearError());
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'Delete my account') return;
    setDropLoading(true);
    const result = await dispatch(removeAccount());
    if (removeAccount.fulfilled.match(result)) navigate('/login');
    setDropLoading(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">

      {/* ── Hero card ── */}
      <div className="card overflow-hidden">
        <div className="h-20 bg-accent/10 relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(99,102,241,0.3) 20px, rgba(99,102,241,0.3) 21px)',
            }}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative w-fit">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 ring-4 ring-card flex items-center justify-center overflow-hidden">
                {form.profilePic ? (
                  <img
                    src={getProfilePicUrl(form.profilePic) ?? ''}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-xl font-bold text-accent">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Change avatar"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent-hover transition-colors"
              >
                {loading ? (
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Saved badge */}
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                ✓ Saved
              </span>
            )}
          </div>

          {/* Name + email */}
          <h2 className="text-xl font-bold text-text">{form.full_name}</h2>
          <p className="text-sm text-muted mt-0.5">{form.email}</p>
        </div>
      </div>

      {/* ── Details + Security ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Personal details */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-text">Personal details</h3>
              <p className="text-xs text-muted mt-0.5">Hover a row to edit</p>
            </div>
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            )}
          </div>

          {(error || fieldError) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-3 py-2.5 mb-3"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] font-bold shrink-0 mt-0.5">!</span>
              <p className="text-xs text-red-700 dark:text-red-300">{fieldError ?? error}</p>
            </div>
          )}

          <EditableRow
            icon={Edit3}
            label="Full name"
            value={editing === 'full_name' ? draft : form.full_name}
            placeholder="Your full name"
            isEditing={editing === 'full_name'}
            onEdit={() => startEdit('full_name')}
            onSave={saveEdit}
            onCancel={cancelEdit}
            onChange={setDraft}
          />
          <EditableRow
            icon={Mail}
            label="Email address"
            value={editing === 'email' ? draft : form.email}
            placeholder="you@example.com"
            isEditing={editing === 'email'}
            onEdit={() => startEdit('email')}
            onSave={saveEdit}
            onCancel={cancelEdit}
            onChange={setDraft}
          />
          <EditableRow
            icon={Phone}
            label="Phone number"
            value={editing === 'phone' ? draft : form.phone}
            placeholder="+1 (555) 000-0000"
            isEditing={editing === 'phone'}
            onEdit={() => startEdit('phone')}
            onSave={saveEdit}
            onCancel={cancelEdit}
            onChange={setDraft}
          />
          <div className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-hover flex items-center justify-center flex-shrink-0">
              <Calendar size={15} className="text-muted" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium mb-0.5">Member since</p>
              <p className="text-sm text-text">{formatDate(form.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Security & account */}
        <div className="card">
          <h3 className="font-bold text-text mb-1">Security & account</h3>
          <p className="text-xs text-muted mb-4">Keep your account safe</p>

          <SecurityRow
            icon={Shield}
            iconColor="text-accent"
            label="Password"
            isActive
            sub="Last changed 3 months ago"
            actionLabel="Change"
            onAction={() => navigate('/send-otp')}
          />
          <SecurityRow
            icon={Award}
            iconColor="text-emerald-500"
            label="Two-factor auth"
            isActive={false}
            sub="Unavailable at this moment"
            subColor="text-slate-500 font-medium"
            actionLabel="Unavailable"
            onAction={() => { }}
          />
          <SecurityRow
            icon={Bell}
            iconColor="text-amber-500"
            label="Notifications"
            isActive={false}
            sub="Email & push enabled"
            actionLabel="Unavailable"
            onAction={() => { }}
          />
          <SecurityRow
            icon={CreditCard}
            iconColor="text-violet-500"
            label="Billing"
            isActive={false}
            sub="Pro · renews Jul 2025"
            actionLabel="Unavailable"
            onAction={() => { }}
          />
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="card border border-red-500/20">
        <h3 className="font-bold text-text mb-1">Danger zone</h3>
        <p className="text-xs text-muted mb-4">Irreversible actions — proceed with care</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 transition-colors">
            <Upload size={14} />
            Export all my data
          </button>
          <button
            onClick={() => setDisplayConfirmBox(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X size={14} />
            Delete account
          </button>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {displayConfirmBox && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-xl">
            <div className="bg-red-50 dark:bg-red-950/40 px-6 py-4 border-b border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={18} className="text-red-700 dark:text-red-300" />
              </div>
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Delete your account</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs text-muted mb-4 leading-relaxed">
                Before you proceed, please read and acknowledge the following:
              </p>

              <ul className="space-y-2 mb-5">
                {[
                  { label: 'All data will be erased.', detail: 'Transactions, budgets, categories, and settings are permanently deleted.' },
                  { label: 'No recovery possible.', detail: 'Your account cannot be restored once deleted.' },
                  { label: 'Active subscriptions cancelled.', detail: 'Pro plan billing is cancelled immediately. Refunds follow our refund policy.' },
                  { label: 'Shared data removed.', detail: 'Any reports shared with other users will become inaccessible.' },
                ].map(({ label, detail }) => (
                  <li key={label} className="flex items-start gap-2.5 text-xs bg-hover rounded-xl p-3">
                    <X size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-text leading-relaxed">
                      <span className="font-semibold">{label}</span> {detail}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mb-5">
                <label className="block text-xs text-muted mb-1.5">
                  Type{' '}
                  <code className="bg-hover text-red-500 px-1.5 py-0.5 rounded text-[11px]">
                    Delete my account
                  </code>{' '}
                  to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type Delete my account here"
                  className="w-full text-sm bg-hover border border-red-500/30 focus:border-red-500 rounded-xl px-3 py-2 outline-none transition-colors text-text"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setDisplayConfirmBox(false); setDeleteConfirmText(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-text hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'Delete my account' || dropLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {dropLoading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <><X size={14} /> Delete my account</>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-muted text-center mt-3">
                By confirming, you agree to our{' '}
                <span className="text-accent hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-accent hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}