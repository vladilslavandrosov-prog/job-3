'use client';

import { useState } from 'react';
import { UserPlus, Crown, Shield, User, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Plan } from '@/types';

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const ROLE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  owner:  { icon: <Crown className="h-3.5 w-3.5" />,  label: 'Владелец', color: 'text-yellow-400' },
  admin:  { icon: <Shield className="h-3.5 w-3.5" />, label: 'Админ',    color: 'text-blue-400' },
  member: { icon: <User className="h-3.5 w-3.5" />,   label: 'Участник', color: 'text-[var(--text-muted)]' },
};

const PLAN_LIMITS: Record<Plan, number> = {
  starter:   1,
  team:      5,
  corporate: 999,
};

export function TeamManager({ members, currentUserId, currentRole, plan }: {
  members: Member[];
  currentUserId: string;
  currentRole: string;
  plan: Plan;
}) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [localMembers, setLocalMembers] = useState(members);

  const limit = PLAN_LIMITS[plan];
  const canInvite = currentRole === 'owner' || currentRole === 'admin';

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (localMembers.length >= limit) {
      toast.error(`Лимит участников на плане «${plan}»: ${limit}`);
      return;
    }
    setInviting(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Приглашение отправлено на ${email}`);
      setEmail('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ошибка приглашения');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(memberId: string, userId: string) {
    if (userId === currentUserId) { toast.error('Нельзя удалить себя'); return; }
    const res = await fetch(`/api/team/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setLocalMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Участник удалён');
    } else {
      toast.error('Ошибка удаления');
    }
  }

  const inner = (
    <div className="space-y-6">
      {/* Invite form */}
      {canInvite && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text)] mb-4">Пригласить участника</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="inv-email">Email</Label>
              <Input
                id="inv-email"
                type="email"
                placeholder="colleague@company.ru"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={inviting} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {inviting ? 'Отправляем...' : 'Пригласить'}
              </Button>
            </div>
          </form>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Участников: {localMembers.length} / {limit === 999 ? '∞' : limit}
          </p>
        </div>
      )}

      {/* Members list */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--border)]/10">
          <h2 className="text-sm font-medium text-[var(--text-muted)]">Участники команды</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {localMembers.map(member => {
            const meta = ROLE_META[member.role] ?? ROLE_META.member;
            const isMe = member.user_id === currentUserId;
            return (
              <div key={member.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-semibold text-sm">
                    {member.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      {isMe ? 'Вы' : member.user_id.slice(0, 8) + '...'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">С {formatDate(member.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
                    {meta.icon}{meta.label}
                  </span>
                  {canInvite && !isMe && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id, member.user_id)}
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <SubscriptionGate feature="TEAM_MANAGEMENT" plan={plan}>
      {inner}
    </SubscriptionGate>
  );
}
