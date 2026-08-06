import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    onClose: () => void;
}

// window.google 타입 선언
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        ux_mode?: string;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        options: {
                            theme?: string;
                            size?: string;
                            width?: number;
                            text?: string;
                            shape?: string;
                            logo_alignment?: string;
                        }
                    ) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { signInWithGSI } = useAuth();
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initGSI = () => {
            if (!window.google?.accounts?.id || !buttonRef.current) return;

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    try {
                        await signInWithGSI(response.credential);
                    } catch (err) {
                        console.error('GSI 로그인 실패:', err);
                    }
                },
                ux_mode: 'popup',
            });

            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
            });
        };

        // GSI 스크립트 로드 대기
        if (window.google?.accounts?.id) {
            initGSI();
        } else {
            const interval = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(interval);
                    initGSI();
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [signInWithGSI]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-10 w-full max-w-sm mx-4 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-xl font-bold"
                >
                    ✕
                </button>

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-[#1A3E62] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 20V5h6.5c3.5 0 5.5 2 5.5 5.5c0 3.2-1.8 5.5-5.5 5.5H10v4H7zm3-7h3.5c1.8 0 2.5-1 2.5-2.5S15.3 8 13.5 8H10v5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">로그인이 필요해요</h2>
                    <p className="text-sm text-gray-500">
                        AI 메시지 생성은 로그인 후 무료로 이용할 수 있어요.
                    </p>
                </div>

                {/* GSI 버튼 컨테이너 */}
                <div className="flex justify-center">
                    <div ref={buttonRef} />
                </div>

                <p className="text-center text-xs text-gray-400 mt-5">
                    로그인 시 서비스 이용약관에 동의하는 것으로 간주합니다.
                </p>
            </div>
        </div>
    );
};
