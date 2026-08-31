import React, { useState, useEffect } from 'react';
import { Shuffle, Send, Lock } from 'lucide-react';
import { generateNickname, getNicknameColor } from '../../utils/nickname';

interface WriteFormProps {
    onSubmit: (nickname: string, message: string, pin: string) => Promise<boolean>;
    submitting: boolean;
}

export const WriteForm: React.FC<WriteFormProps> = ({ onSubmit, submitting }) => {
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [pinError, setPinError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setNickname(generateNickname());
    }, []);

    const colorClass = getNicknameColor(nickname);

    const handleShuffle = () => {
        setNickname(generateNickname());
    };

    const handlePinChange = (idx: number, value: string) => {
        const v = value.replace(/\D/g, '').slice(-1);
        const next = [...pin];
        next[idx] = v;
        setPin(next);
        setPinError('');
        // 자동 포커스 다음 칸
        if (v && idx < 3) {
            const next_input = document.getElementById(`pin-write-${idx + 1}`);
            next_input?.focus();
        }
    };

    const handlePinKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
            document.getElementById(`pin-write-${idx - 1}`)?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const pinStr = pin.join('');
        if (pinStr.length < 4) { setPinError('PIN 4자리를 모두 입력해 주세요'); return; }
        if (!message.trim() || message.trim().length < 5) { return; }
        if (!nickname.trim()) { return; }

        const ok = await onSubmit(nickname.trim(), message.trim(), pinStr);
        if (ok) {
            setMessage('');
            setPin(['', '', '', '']);
            setNickname(generateNickname());
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">닉네임</p>
                        {/* 현재 닉네임 컬러 뱃지 미리보기 */}
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${colorClass} max-w-[170px] truncate`}>
                            {nickname || '…'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleShuffle}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 shadow-xs transition-all active:scale-95 shrink-0"
                        title="새 닉네임 뽑기"
                    >
                        <Shuffle className="w-3 h-3 text-indigo-600" />
                        <span>랜덤 뽑기</span>
                    </button>
                </div>

                {/* 100% 고정 인풋 필드 */}
                <div className="relative">
                    <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        maxLength={25}
                        placeholder="닉네임을 직접 수정할 수도 있어요"
                        className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-900 transition-colors shadow-xs"
                    />
                </div>
            </div>

            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">메시지</p>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="피드백, 응원, 질문 등 자유롭게 남겨주세요 (5~200자)"
                    className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-900 transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{message.length}/200</p>
            </div>

            <div>
                <div className="flex items-center gap-1.5 mb-2">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">수정·삭제용 PIN 4자리</p>
                </div>
                <div className="flex gap-2">
                    {pin.map((d, i) => (
                        <input
                            key={i}
                            id={`pin-write-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handlePinChange(i, e.target.value)}
                            onKeyDown={e => handlePinKeyDown(i, e)}
                            className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                                ${d ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white'}
                                focus:border-gray-900`}
                        />
                    ))}
                </div>
                {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
                <p className="text-xs text-gray-400 mt-1.5">이 PIN으로 나중에 수정·삭제할 수 있어요. 잊어버리면 복구 불가!</p>
            </div>

            {success && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 rounded-xl px-4 py-3">
                    ✓ 방명록에 남겨주셔서 감사합니다!
                </div>
            )}

            <button
                type="submit"
                disabled={submitting || !message.trim() || message.trim().length < 5 || !nickname.trim() || pin.some(d => !d)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm
                    hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Send className="w-4 h-4" />
                {submitting ? '저장 중…' : '방명록 남기기'}
            </button>
        </form>
    );
};
