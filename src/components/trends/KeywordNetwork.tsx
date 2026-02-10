import React, { useState, useMemo } from 'react';
import { AlgorithmInfoModal } from './AlgorithmInfoModal';
import type { KeywordPair } from '../../hooks/useKeywordTrends';

interface KeywordNetworkProps {
    pairs: KeywordPair[];
    isLoading?: boolean;
}

export const KeywordNetwork: React.FC<KeywordNetworkProps> = ({
    pairs,
    isLoading,
}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // 네트워크 데이터 계산
    const networkData = useMemo(() => {
        if (pairs.length === 0) return { nodes: [], links: [] };

        // 노드 추출 및 연결 수 계산
        const nodeConnections = new Map<string, number>();
        const nodeStrength = new Map<string, number>();

        for (const pair of pairs) {
            nodeConnections.set(pair.source, (nodeConnections.get(pair.source) || 0) + 1);
            nodeConnections.set(pair.target, (nodeConnections.get(pair.target) || 0) + 1);
            nodeStrength.set(pair.source, (nodeStrength.get(pair.source) || 0) + pair.count);
            nodeStrength.set(pair.target, (nodeStrength.get(pair.target) || 0) + pair.count);
        }

        // 상위 노드만 선택 (복잡도 제한)
        const topNodes = [...nodeStrength.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([name]) => name);

        const nodeSet = new Set(topNodes);

        const nodes = topNodes.map(name => ({
            id: name,
            connections: nodeConnections.get(name) || 0,
            strength: nodeStrength.get(name) || 0,
        }));

        const links = pairs
            .filter(p => nodeSet.has(p.source) && nodeSet.has(p.target))
            .slice(0, 20);

        return { nodes, links };
    }, [pairs]);

    // 선택된 노드의 연결 키워드
    const connectedKeywords = useMemo(() => {
        if (!selectedNode) return [];

        return pairs
            .filter(p => p.source === selectedNode || p.target === selectedNode)
            .map(p => ({
                keyword: p.source === selectedNode ? p.target : p.source,
                count: p.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [selectedNode, pairs]);

    // 간단한 원형 레이아웃 계산
    const getNodePosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const radius = 120;
        return {
            x: 150 + radius * Math.cos(angle),
            y: 140 + radius * Math.sin(angle),
        };
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔗</span>
                        <h3 className="font-semibold text-gray-900">연관 키워드 네트워크</h3>
                    </div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="알고리즘 설명 보기"
                    >
                        <span className="text-xs font-bold">?</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="animate-pulse h-72 bg-gray-100 rounded-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                ) : networkData.nodes.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-gray-400">
                        연관 키워드가 없습니다
                    </div>
                ) : (
                    <div className="flex gap-4">
                        {/* 네트워크 SVG */}
                        <div className="flex-1">
                            <svg
                                viewBox="0 0 300 280"
                                className="w-full h-72"
                            >
                                {/* 연결선 */}
                                {networkData.links.map((link, i) => {
                                    const sourceIdx = networkData.nodes.findIndex(n => n.id === link.source);
                                    const targetIdx = networkData.nodes.findIndex(n => n.id === link.target);
                                    if (sourceIdx === -1 || targetIdx === -1) return null;

                                    const source = getNodePosition(sourceIdx, networkData.nodes.length);
                                    const target = getNodePosition(targetIdx, networkData.nodes.length);
                                    const isHighlighted = selectedNode === link.source || selectedNode === link.target;

                                    return (
                                        <line
                                            key={`link-${i}`}
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={isHighlighted ? '#6366f1' : '#e5e7eb'}
                                            strokeWidth={Math.min(link.count, 4)}
                                            strokeOpacity={isHighlighted ? 0.8 : 0.5}
                                        />
                                    );
                                })}

                                {/* 노드 */}
                                {networkData.nodes.map((node, i) => {
                                    const pos = getNodePosition(i, networkData.nodes.length);
                                    const isSelected = selectedNode === node.id;
                                    const isConnected = selectedNode && pairs.some(
                                        p => (p.source === selectedNode && p.target === node.id) ||
                                            (p.target === selectedNode && p.source === node.id)
                                    );
                                    const size = Math.min(24, 12 + node.connections * 2);

                                    return (
                                        <g
                                            key={node.id}
                                            className="cursor-pointer"
                                            onClick={() => setSelectedNode(isSelected ? null : node.id)}
                                        >
                                            <circle
                                                cx={pos.x}
                                                cy={pos.y}
                                                r={size}
                                                fill={isSelected ? '#4f46e5' : isConnected ? '#818cf8' : '#f3f4f6'}
                                                stroke={isSelected ? '#4338ca' : isConnected ? '#6366f1' : '#d1d5db'}
                                                strokeWidth={2}
                                                className="transition-all duration-200 hover:stroke-indigo-500"
                                            />
                                            <text
                                                x={pos.x}
                                                y={pos.y + size + 14}
                                                textAnchor="middle"
                                                className={`text-xs ${isSelected || isConnected ? 'fill-gray-900 font-medium' : 'fill-gray-500'}`}
                                            >
                                                {node.id.length > 6 ? node.id.slice(0, 6) + '...' : node.id}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* 선택된 노드 정보 */}
                        <div className="w-36">
                            {selectedNode ? (
                                <div className="bg-indigo-50 rounded-xl p-3">
                                    <p className="font-bold text-indigo-900 mb-2 truncate">
                                        {selectedNode}
                                    </p>
                                    <p className="text-xs text-indigo-600 mb-2">함께 등장하는 키워드</p>
                                    <div className="space-y-1">
                                        {connectedKeywords.map(k => (
                                            <div
                                                key={k.keyword}
                                                className="flex items-center justify-between text-xs"
                                            >
                                                <span className="text-gray-700 truncate">{k.keyword}</span>
                                                <span className="text-gray-400">{k.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs text-center p-3">
                                    노드를 클릭하면<br />연관 키워드를<br />확인할 수 있습니다
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 범례 */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
                        <span>키워드</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-6 h-0.5 bg-gray-300" />
                        <span>함께 등장</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span>선택됨</span>
                    </div>
                </div>
            </div>

            <AlgorithmInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
                algorithmKey="cooccurrence"
            />
        </>
    );
};
