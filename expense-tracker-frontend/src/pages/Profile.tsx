// src/pages/Settings/Profile.tsx
import React, { useState, useRef } from 'react';
import {
  Camera, Mail, Phone, MapPin, Calendar,
  Shield, Bell, CreditCard, TrendingUp,
  Edit3, Check, X, Upload, Award,
  Activity, DollarSign, Target,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { formatDate } from '@/hooks/use-format';
import { clearError, modifyUserProfile } from '@/store/slices/userSlices/user.slice';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditableField {
  field: 'full_name' | 'phone' | 'email' | 'bio' | null;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-text leading-tight mt-0.5">{value}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Inline editable field ─────────────────────────────────────────────────────

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
  onEdit: () => void; onSave: () => void; onCancel: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 group">
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
          <p className="text-sm text-text truncate">{value || <span className="text-muted italic">{placeholder}</span>}</p>
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

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, error, loading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch()
  // Local editable state (wire to dispatch/API as needed)
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    created_at: user?.created_at ?? '',
    bio: '',
    // location: user?.location ?? '',
    // bio:      user?.bio      ?? '',
  });

  const [editing, setEditing] = useState<EditableField['field']>(null);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  //   const [avatarSrc, setAvatarSrc] = useState<string | null>(user?.avatarUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = form.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function startEdit(field: EditableField['field']) {
    dispatch(clearError())
    setFieldError(null)
    setEditing(field);
    setDraft(form[field as keyof typeof form] ?? '');
  }

  async function saveEdit() {
    if (!editing || !draft.trim()) {
      setFieldError('Field cannot be empty');
      return;
    }
    if (editing === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(draft)) {
        setFieldError('Invalid email address');
        return;
      }
    }

    if (editing === 'phone') {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(draft)) {
        setFieldError('Invalid phone number');
        return;
      }
    }

    if (editing === 'full_name' && draft.trim().length < 2) {
      setFieldError('Name must be at least 2 characters');
      return;
    }
    const result = await dispatch(modifyUserProfile({ [editing]: draft.trim() }))

    if (modifyUserProfile.fulfilled.match(result)) {
      setForm((prev) => ({ ...prev, [editing]: draft.trim() }));
      setEditing(null);
      setFieldError(null);
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

  const stats = [
    // { icon: DollarSign, label: 'Total spent',    value: formatCurrency(4280),  sub: 'This month',    color: 'bg-accent'       },
    { icon: Target, label: 'Budgets active', value: '5', sub: '2 near limit', color: 'bg-violet-500' },
    { icon: Activity, label: 'Transactions', value: '128', sub: 'Last 30 days', color: 'bg-emerald-500' },
    { icon: TrendingUp, label: 'Saved vs last', value: '+12%', sub: 'Month on month', color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── Hero card ── */}
      <div className="card overflow-hidden">
        {/* Banner strip */}
        <div className="h-24 bg-accent/10 relative">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(99,102,241,0.3) 20px, rgba(99,102,241,0.3) 21px)',
            }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            <div className="relative w-fit">
              <div className="w-24 h-24 rounded-2xl border-4 border-card bg-accent/20 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-2xl font-bold text-accent">{initials}</span>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Change avatar"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent-hover transition-colors"
              >
                <Camera size={13} />
              </button>
              {/* <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              /> */}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge label="Pro member" color="bg-accent/10 text-accent" />
              <Badge label="Verified" color="bg-emerald-500/10 text-emerald-600" />
              {saved && (
                <Badge label="✓ Saved" color="bg-emerald-500/10 text-emerald-600" />
              )}
            </div>
          </div>

          {/* Name + email */}
          <div className="mb-1">
            <h2 className="text-xl font-bold text-text">{form.full_name}</h2>
            <p className="text-sm text-muted mt-0.5">{form.email}</p>
          </div>

          {/* Bio */}
          <div className="group flex items-start gap-2 mt-3">
            {editing === 'bio' ? (
              <div className="flex-1 flex items-start gap-2">
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a short bio…"
                  rows={2}
                  className="flex-1 text-sm text-text bg-hover border border-accent/40 rounded-xl px-3 py-2 outline-none focus:border-accent resize-none transition-colors"
                />
                <div className="flex flex-col gap-1 mt-0.5">
                  <button onClick={saveEdit} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"><Check size={13} /></button>
                  <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-hover text-muted transition-colors"><X size={13} /></button>
                </div>
              </div>
            ) : (
              <>
                {/* <p className="flex-1 text-sm text-muted leading-relaxed">
                  {form.bio || <span className="italic">Add a short bio to personalize your profile…</span>}
                </p> */}
                <button
                  onClick={() => startEdit('bio')}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-hover text-muted transition-all flex-shrink-0"
                >
                  <Edit3 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Details + Security side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Personal details */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-text">Personal details</h3>
              <p className="text-xs text-muted mt-0.5">Hover a row to edit</p>
            </div>
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            )}
          </div>
          {(error || fieldError) && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-3 py-2.5 mb-3">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] font-bold shrink-0 mt-0.5">!</span>
              <p className="text-xs text-red-700 dark:text-red-300">{fieldError ?? error}</p>
            </div>
          )}
          <div className="divide-y divide-border">
            <EditableRow
              icon={Edit3} label="Full name"
              value={editing === 'full_name' ? draft : form.full_name}
              placeholder="Your full name"
              isEditing={editing === 'full_name'}
              onEdit={() => startEdit('full_name')}
              onSave={saveEdit} onCancel={cancelEdit}
              onChange={setDraft}
            />
            <EditableRow
              icon={Mail} label="Email address"
              value={editing === 'email' ? draft : form.email}
              placeholder="you@example.com"
              isEditing={editing === 'email'}
              onEdit={() => startEdit('email')}
              onSave={saveEdit} onCancel={cancelEdit}
              onChange={setDraft}
            />
            <EditableRow
              icon={Phone} label="Phone number"
              value={editing === 'phone' ? draft : form.phone}
              placeholder="+1 (555) 000-0000"
              isEditing={editing === 'phone'}
              onEdit={() => startEdit('phone')}
              onSave={saveEdit} onCancel={cancelEdit}
              onChange={setDraft}
            />            {/* <EditableRow
              icon={MapPin}   label="Location"
              value={form.location} placeholder="City, Country"
              isEditing={editing === 'location'}
              onEdit={() => startEdit('location')}
              onSave={saveEdit} onCancel={cancelEdit}
              onChange={setDraft}
            /> */}
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
        </div>

        {/* Security & account */}
        <div className="card">
          <h3 className="font-bold text-text mb-1">Security & account</h3>
          <p className="text-xs text-muted mb-4">Keep your account safe</p>

          <div className="space-y-3">
            {/* Password */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                  <Shield size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Password</p>
                  <p className="text-xs text-muted">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-accent hover:underline">
                Change
              </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                  <Award size={15} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Two-factor auth</p>
                  <p className="text-xs text-emerald-500 font-medium">Enabled</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-muted hover:text-text transition-colors">
                Manage
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                  <Bell size={15} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Notifications</p>
                  <p className="text-xs text-muted">Email & push enabled</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-accent hover:underline">
                Configure
              </button>
            </div>

            {/* Billing */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-hover">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                  <CreditCard size={15} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Billing</p>
                  <p className="text-xs text-muted">Pro · renews Jul 2025</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-accent hover:underline">
                Manage
              </button>
            </div>
          </div>
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
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
            <X size={14} />
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
