import React, { useState, useRef, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

interface PinModalProps {
    title: string;
    description: string;
    onConfirm: (pin: string) => void;
    onCancel: () => void;
    error?: string | null;
}

export const PinModal: React.FC<PinModalProps> = ({ title, description, onConfirm, onCancel, error }) => {
    const [digits, setDigits] = useState(['', '', '', '']);
    const refs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        refs[0].current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (idx: number, value: string) => {
        const v = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[idx] = v;
        setDigits(next);
        if (v && idx < 3) refs[idx + 1].current?.focus();
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            refs[idx - 1].current?.focus();
        }
        if (e.key === 'Enter' && digits.every(d => d)) {
            onConfirm(digits.join(''));
        }
    };

    const handleSubmit = () => {
        if (digits.every(d => d)) onConfirm(digits.join(''));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
            <div
                className="bg-white rounded-2xl shadow-2xl p-8 w-80 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>

                    {/* 4자리 PIN 입력 */}
                    <div className="flex gap-3 mt-2">
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={refs[i]}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                                    ${d ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}
                                    focus:border-gray-900`}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!digits.every(d => d)}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm
                            hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};
