import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { BookOpen, Loader2, Copy, Check, Database } from 'lucide-react';
import { useGuestbook } from '../hooks/useGuestbook';
import { WriteForm } from '../components/guestbook/WriteForm';
import { MessageCard } from '../components/guestbook/MessageCard';

export const Guestbook: React.FC = () => {
    const {
        entries,
        loading,
        submitting,
        isUsingLocalFallback,
        addEntry,
        verifyPin,
        updateEntry,
        deleteEntry,
        refetch,
    } = useGuestbook();

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-28 pb-24">

                {/* 헤더 */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-4">
                        <BookOpen className="w-3.5 h-3.5" />
                        Guestbook
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                        방명록
                    </h1>
                    <p className="mt-2 text-gray-500 text-base leading-relaxed">
                        PushNow 프로젝트를 둘러보시고 느낀 점이나 피드백, 응원 한마디를 자유롭게 남겨주세요! 🙏
                    </p>
                </div>

                {/* 2컬럼 레이아웃 */}
                <div className="grid lg:grid-cols-[380px_1fr] gap-10 items-start">

                    {/* 왼쪽: 작성 폼 (sticky) */}
                    <div className="lg:sticky lg:top-24">
                        <WriteForm onSubmit={addEntry} submitting={submitting} />
                    </div>

                    {/* 오른쪽: 메시지 목록 */}
                    <div className="space-y-3">
                        {loading && entries.length === 0 ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8">
                                <p className="text-4xl mb-3">🌱</p>
                                <p className="text-gray-600 font-semibold">아직 등록된 방명록이 없어요.</p>
                                <p className="text-gray-400 text-xs mt-1">왼쪽에서 귀여운 닉네임과 함께 첫 글을 남겨보세요!</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <p className="text-xs text-gray-500 font-medium">
                                        총 <span className="font-bold text-gray-900">{entries.length}</span>개의 응원 메시지
                                    </p>
                                </div>
                                {entries.map(entry => (
                                    <MessageCard
                                        key={entry.id}
                                        entry={entry}
                                        onVerifyPin={verifyPin}
                                        onUpdate={updateEntry}
                                        onDelete={deleteEntry}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Supabase 셋업 SQL ── */
export const SQL_SETUP = `
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  message     text not null check (char_length(message) between 5 and 200),
  pin_hash    text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  deleted_at  timestamptz
);

alter table public.guestbook enable row level security;

create policy "Anyone can read guestbook" on public.guestbook
  for select using (deleted_at is null);

create policy "Anyone can insert guestbook" on public.guestbook
  for insert with check (true);

create policy "Anyone can update guestbook" on public.guestbook
  for update using (true);
`.trim();

