import React from 'react';
import { Navbar } from '../components/Navbar';

export const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-24 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center py-20">
                    <h1 className="text-6xl font-black mb-4">👤 Contact</h1>
                    <p className="text-xl text-zinc-600">
                        내 정보 관리 및 앱 추가 요청
                    </p>

                    <div className="mt-12 p-8 border-2 border-dashed border-zinc-200 rounded-2xl">
                        <p className="text-zinc-400">구현 예정: 프로필 및 앱 추가 요청 폼</p>
                    </div>
                </div>
            </main>
        </div>
    );
};
