import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { GuestbookEntry } from '../../hooks/useGuestbook';
import { getNicknameColor } from '../../utils/nickname';
import { PinModal } from './PinModal';

interface MessageCardProps {
    entry: GuestbookEntry;
    onVerifyPin: (entry: GuestbookEntry, pin: string) => Promise<boolean> | boolean;
    onUpdate: (id: string, message: string) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
}

type ModalMode = 'edit' | 'delete' | null;

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const MessageCard: React.FC<MessageCardProps> = ({ entry, onVerifyPin, onUpdate, onDelete }) => {
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [pinError, setPinError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(entry.message);
    const [saving, setSaving] = useState(false);

    const colorClass = getNicknameColor(entry.nickname);

    const handlePinConfirm = async (pin: string) => {
        const ok = await onVerifyPin(entry, pin);
        if (!ok) {
            setPinError('PIN이 일치하지 않습니다 🔒');
            return;
        }
        setPinError(null);
        if (modalMode === 'edit') {
            setIsEditing(true);
            setEditText(entry.message);
        } else if (modalMode === 'delete') {
            onDelete(entry.id);
        }
        setModalMode(null);
    };

    const handleSave = async () => {
        if (!editText.trim() || editText.trim().length < 5) return;
        setSaving(true);
        const ok = await onUpdate(entry.id, editText.trim());
        if (ok) setIsEditing(false);
        setSaving(false);
    };

    return (
        <>
            {modalMode && (
                <PinModal
                    title={modalMode === 'edit' ? '수정 확인' : '삭제 확인'}
                    description="작성 시 설정한 4자리 PIN을 입력해 주세요."
                    onConfirm={handlePinConfirm}
                    onCancel={() => { setModalMode(null); setPinError(null); }}
                    error={pinError}
                />
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-3">
                    {/* 닉네임 뱃지 + 날짜 */}
                    <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
                            {entry.nickname}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(entry.created_at)}</span>
                    </div>

                    {/* 수정/삭제 버튼 (hover 시 표시) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={() => { setModalMode('edit'); setPinError(null); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="수정"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => { setModalMode('delete'); setPinError(null); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="삭제"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* 메시지 본문 */}
                {isEditing ? (
                    <div className="mt-3 space-y-2">
                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            maxLength={200}
                            rows={3}
                            className="w-full text-sm text-gray-700 leading-relaxed border border-gray-300 rounded-xl p-3 resize-none outline-none focus:border-gray-900 transition-colors"
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{editText.length}/200</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-3 h-3" /> 취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || editText.trim().length < 5}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-black transition-colors disabled:opacity-40"
                                >
                                    <Check className="w-3 h-3" /> 저장
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                )}
            </div>
        </>
    );
};
