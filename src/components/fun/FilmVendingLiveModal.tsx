'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MapPin,
  QrCode,
  Battery,
  Film,
  Clock,
  Sparkles,
  CheckCircle2,
  Navigation,
  RefreshCw,
  Box,
  Truck,
  ShieldCheck,
  ChevronRight,
  Flame
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';

interface VendingStation {
  id: string;
  name: string;
  location: string;
  distance: string;
  is24h: boolean;
  films: { name: string; stock: number; price: number }[];
  batteries: { name: string; stock: number; price: number }[];
  dropBoxAvailable: boolean;
}

const VENDING_STATIONS: VendingStation[] = [
  {
    id: 'euljiro-3ga',
    name: '을지로3가역 4번출구 명장 수선대 자판기',
    location: '서울 중구 을지로 122 앞',
    distance: '350m (도보 4분)',
    is24h: true,
    films: [
      { name: 'Kodak Gold 200', stock: 3, price: 17000 },
      { name: 'Fuji Color C200', stock: 2, price: 18000 },
      { name: 'Ilford HP5 Plus', stock: 4, price: 16000 }
    ],
    batteries: [
      { name: 'LR44 1.5V (2개입)', stock: 6, price: 3000 },
      { name: 'CR2 3V 리튬', stock: 2, price: 6000 }
    ],
    dropBoxAvailable: true
  },
  {
    id: 'seongsu-yeonmu',
    name: '성수 연무장길 아틀리에 무인 큐브',
    location: '서울 성동구 연무장길 32',
    distance: '1.2km',
    is24h: true,
    films: [
      { name: 'Kodak Portra 400', stock: 1, price: 28000 },
      { name: 'Cinestill 800T', stock: 2, price: 31000 },
      { name: 'Kodak UltraMax 400', stock: 5, price: 19000 }
    ],
    batteries: [
      { name: 'LR44 1.5V (2개입)', stock: 4, price: 3000 },
      { name: 'CR123A 3V', stock: 3, price: 7000 }
    ],
    dropBoxAvailable: true
  },
  {
    id: 'hongdae-exit9',
    name: '홍대입구역 9번출구 24시 필름 벤더',
    location: '서울 마포구 양화로 160',
    distance: '2.8km',
    is24h: true,
    films: [
      { name: 'Kodak ColorPlus 200', stock: 6, price: 16000 },
      { name: 'Fuji Superia 400', stock: 3, price: 21000 }
    ],
    batteries: [
      { name: 'LR44 1.5V (2개입)', stock: 8, price: 3000 }
    ],
    dropBoxAvailable: false
  }
];

interface FilmVendingLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilmVendingLiveModal: React.FC<FilmVendingLiveModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useDasi();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pickup' | 'drop'>('pickup');
  const [selectedStationId, setSelectedStationId] = useState<string>('euljiro-3ga');
  const [selectedItemName, setSelectedItemName] = useState<string>('Kodak Gold 200');

  // QR Hold state
  const [isHolding, setIsHolding] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(900); // 15 mins

  // Drop Box state
  const [filmType, setFilmType] = useState<'c41' | 'bw' | 'e6'>('c41');
  const [dropPin, setDropPin] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer countdown for QR hold
  useEffect(() => {
    if (!isHolding) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsHolding(false);
          showToast('15분 픽업 유효시간이 만료되었습니다.', 'warning');
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHolding, showToast]);

  if (!isOpen || !mounted) return null;

  const currentStation =
    VENDING_STATIONS.find((s) => s.id === selectedStationId) || VENDING_STATIONS[0];

  const handleStartHold = () => {
    setIsHolding(true);
    setRemainingSeconds(900);
    playShutterSound('slr');
    showToast('🏷️ 15분 긴급 픽업 예약 QR 코드가 발급되었습니다.', 'success');
  };

  const handleGenerateDropPin = () => {
    playShutterSound('compact');
    const randomPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setDropPin(randomPin);
    showToast('📦 충무로 당일 특급 드롭박스 투입 번호가 생성되었습니다!', 'success');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                O2O LIVE DROP & PICKUP
              </div>
              <h2 className="text-lg font-bold font-serif text-stone-50">
                24시 자판기 실시간 픽업 & 드롭박스
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-2 bg-stone-900/40 border-b border-stone-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pickup'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>15분 긴급 필름/배터리 픽업</span>
          </button>
          <button
            onClick={() => setActiveTab('drop')}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'drop'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>무인 필름 드롭박스 접수</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Station Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>가장 가까운 24시 자판기 / 수선대 선택:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VENDING_STATIONS.map((station) => (
                <button
                  key={station.id}
                  onClick={() => {
                    setSelectedStationId(station.id);
                    setIsHolding(false);
                    playShutterSound('compact');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedStationId === station.id
                      ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                      : 'border-stone-800 bg-stone-900/50 hover:bg-stone-900 text-stone-400'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{station.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 font-mono">
                    <span>{station.distance}</span>
                    <span className="text-emerald-400">24H 가동</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'pickup' ? (
            /* TAB 1: PICKUP */
            <div className="space-y-6">
              {isHolding ? (
                /* QR Hold Active State */
                <div className="bg-stone-900 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>남은 픽업 시간: {formatTimer(remainingSeconds)}</span>
                  </div>

                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="w-full h-full border-4 border-stone-900 p-2 flex flex-col items-center justify-center">
                      <QrCode className="w-32 h-32 text-stone-950" />
                      <span className="text-[9px] font-mono text-stone-800 font-bold mt-1">DASI-HOLD-QR</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-100 text-sm">
                      {selectedItemName} (1개) 픽업 예약 완료
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      {currentStation.name} 자판기 바코드 리더기에 위 QR 코드를 비추면 즉시 배출됩니다.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsHolding(false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-mono text-stone-400 hover:text-stone-200"
                  >
                    예약 취소
                  </button>
                </div>
              ) : (
                /* Stock List & Item Select */
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-mono text-stone-400 mb-2 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      <span>실시간 잔여 필름 재고</span>
                    </div>
                    <div className="space-y-2">
                      {currentStation.films.map((f, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedItemName(f.name)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedItemName === f.name
                              ? 'border-amber-500 bg-amber-950/20'
                              : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-200">{f.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              잔여 {f.stock}롤 · 즉시 수령 가능
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xs font-mono text-amber-400">
                              {f.price.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-mono text-stone-400 mb-2 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-amber-400" />
                      <span>카메라 긴급 배터리 재고</span>
                    </div>
                    <div className="space-y-2">
                      {currentStation.batteries.map((b, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedItemName(b.name)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedItemName === b.name
                              ? 'border-amber-500 bg-amber-950/20'
                              : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-200">{b.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              잔여 {b.stock}개
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xs font-mono text-amber-400">
                              {b.price.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStartHold}
                    className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>[{selectedItemName}] 15분 원격 픽업 QR 발급받기</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: DROP BOX */
            <div className="space-y-6">
              <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>충무로 명장 현상소 당일 특급 이송 파이프라인</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  자판기 옆 DASI 안심 드롭박스에 촬영 완료된 필름을 투입하시면,
                  매일 14:00 / 19:00 충무로 현상소로 직송되어 당일 밤 고화질 디지털 스캔본 링크가 카카오톡/앱으로 발송됩니다.
                </p>
              </div>

              {dropPin ? (
                <div className="bg-stone-900 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-400">드롭박스 투입 인증번호 (PIN)</div>
                    <div className="text-3xl font-black font-mono text-amber-400 mt-1 tracking-widest">
                      {dropPin}
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      드롭박스 도어락에 위 PIN 번호를 입력하고 필름을 넣은 뒤 문을 닫아주세요.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-stone-400 mb-2 block">
                      현상 종류 선택
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'c41' as const, label: 'C-41 컬러', price: '7,000원' },
                        { type: 'bw' as const, label: '흑백 (B&W)', price: '9,000원' },
                        { type: 'e6' as const, label: 'E-6 슬라이드', price: '15,000원' }
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => setFilmType(item.type)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            filmType === item.type
                              ? 'border-amber-500 bg-amber-950/20 text-stone-100'
                              : 'border-stone-800 bg-stone-900/60 text-stone-400'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">{item.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateDropPin}
                    className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Box className="w-4 h-4" />
                    <span>드롭박스 투입 번호 발급받기</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
