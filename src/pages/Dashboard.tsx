import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Icons } from '../components/common/Icons';
import { VolumeChart } from '../components/charts/VolumeChart';
import { TrajectoryChart } from '../components/charts/TrajectoryChart';
import { Heatmap } from '../components/Heatmap';

export const Dashboard: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-[#fcfcfc] text-slate-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => { }} />

                <main className="flex-1 p-6 lg:p-12 overflow-y-auto w-full max-w-[1920px] mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                                    오늘의 인사이트
                                </span>
                            </div>
                            <h1 className="text-3xl lg:text-5xl font-extralight tracking-tight text-black">
                                푸시 분석 대시보드
                            </h1>
                            <p className="text-sm font-light text-gray-500 leading-relaxed max-w-lg">
                                경쟁사 푸시 알림 패턴과 트렌드를 실시간으로 분석합니다
                            </p>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <button className="flex-1 md:flex-none h-10 px-6 border border-border bg-white hover:bg-gray-50 text-[10px] font-semibold uppercase tracking-widest text-gray-600 flex items-center justify-center gap-2 transition-colors">
                                <Icons.Calendar size={14} />
                                최근 7일
                            </button>
                            <button className="flex-1 md:flex-none h-10 px-6 bg-black hover:bg-gray-900 text-[10px] font-semibold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-colors shadow-lg shadow-black/5">
                                <Icons.Share size={14} />
                                리포트 공유
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-12 gap-6 lg:gap-12">
                        {/* AI Intelligence Card */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="flex items-center gap-3 border-b border-transparent pb-2">
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                                    01 // 추천 발송 시간
                                </span>
                            </div>
                            <div className="bg-white border border-border p-8 lg:p-10 flex flex-col h-full relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                <div className="absolute top-8 right-8 text-gray-100">
                                    <Icons.Sparkles size={64} strokeWidth={1} />
                                </div>

                                <div className="mb-12 relative z-10">
                                    <h2 className="text-3xl font-light mb-6 tracking-tight">
                                        최적
                                        <br />
                                        시간대
                                    </h2>
                                    <p className="text-sm font-light text-gray-400 leading-relaxed">
                                        경쟁사 발송 밀도가 낮은{' '}
                                        <span className="text-black font-medium border-b border-gray-200">
                                            골든 타임
                                        </span>
                                        을 찾았습니다
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <div className="mb-8">
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.25em] block mb-2">
                                            추천 시간대
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extralight tracking-tighter tabular-nums">
                                                화 10:00
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                KST
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-border">
                                        <p className="text-[11px] text-gray-500 font-light italic leading-relaxed">
                                            "경쟁 밀도가 42% 낮은 시간대로, 높은 가시성을 확보할 수 있습니다"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Volume Chart */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            <div className="flex justify-between items-end border-b border-transparent pb-2">
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                                    02 // 발송량 추이
                                </span>
                            </div>
                            <div className="bg-white border border-border p-8 lg:p-10 h-full min-h-[400px] flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                <div className="flex items-start gap-4 mb-12">
                                    <span className="text-6xl font-extralight tracking-tighter tabular-nums">
                                        1.24M
                                    </span>
                                    <span className="text-[10px] font-bold text-black bg-gray-50 border border-border px-3 py-1.5">
                                        +12.3% 증가
                                    </span>
                                </div>
                                <div className="flex-1 w-full h-64">
                                    <VolumeChart />
                                </div>
                                <div className="flex justify-between mt-8 border-t border-border pt-4">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                        주간 집계
                                    </div>
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                        실시간 데이터
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        <div className="col-span-12 flex flex-col gap-6 mt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-transparent pb-2">
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                                    03 // 시간대별 밀도 분석
                                </span>
                            </div>
                            <div className="bg-white border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                                <Heatmap />
                            </div>
                        </div>

                        {/* Trajectory Chart */}
                        <div className="col-span-12 flex flex-col gap-6 mt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-transparent pb-2">
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">
                                    04 // 키워드 트렌드
                                </span>
                            </div>
                            <div className="bg-white border border-border p-8 lg:p-12 h-[400px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                <TrajectoryChart />
                            </div>
                        </div>
                    </div>

                    <footer className="mt-24 pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-300">
                        <p className="text-[10px] uppercase tracking-[0.25em] font-medium">
                            PushNow Analytics Platform
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-medium">
                            Last Update: {new Date().toLocaleDateString('ko-KR')}
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};
