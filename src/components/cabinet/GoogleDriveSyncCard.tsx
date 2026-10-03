'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FolderLock,
  Film,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { playShutterSound } from '@/utils/shutterAudio';
import { useDasi } from '@/context/DasiContext';
import type { GoogleDriveStatusResponse } from '@/app/api/cloud/google-drive/route';

export const GoogleDriveSyncCard: React.FC = () => {
  const { showToast } = useDasi();
  const [status, setStatus] = useState<GoogleDriveStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Fetch initial status
  useEffect(() => {
    fetch('/api/cloud/google-drive')
      .then((res) => res.json())
      .then((data: GoogleDriveStatusResponse) => {
        setStatus(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Google Drive status:', err);
        setIsLoading(false);
      });
  }, []);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(15);
    playShutterSound('slr');

    // Smooth progress simulation
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    try {
      const res = await fetch('/api/cloud/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_now' }),
      });
      clearInterval(interval);
      setSyncProgress(100);

      if (res.ok) {
        const json = await res.json();
        setStatus(json.status);
        showToast(json.message || '✨ 구글 드라이브 동기화가 완료되었습니다!', 'success');
      }
    } catch {
      showToast('동기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'warning');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 500);
    }
  };

  const handleToggleOption = async (key: keyof GoogleDriveStatusResponse['syncOptions']) => {
    if (!status) return;
    const newOptions = {
      ...status.syncOptions,
      [key]: !status.syncOptions[key],
    };

    setStatus({
      ...status,
      syncOptions: newOptions,
    });

    playShutterSound('compact');

    try {
      await fetch('/api/cloud/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_options', options: newOptions }),
      });
      showToast('클라우드 자동 백업 설정이 저장되었습니다.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    playShutterSound('compact');
    setIsLoading(true);
    try {
      const res = await fetch('/api/cloud/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', email: 'story.analog@gmail.com' }),
      });
      if (res.ok) {
        const json = await res.json();
        setStatus(json.status);
        showToast('🟢 Google One 계정이 안전하게 연동되었습니다!', 'success');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('구글원 스토리지 연동을 해제하시겠습니까? 기존 백업된 사진은 구글 드라이브에 안전하게 보존됩니다.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/cloud/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      if (res.ok) {
        const json = await res.json();
        setStatus(json.status);
        showToast('구글원 연동이 해제되었습니다.', 'info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !status) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-vintage-200/90 shadow-2xs animate-pulse">
        <div className="h-6 w-48 bg-vintage-100 rounded-md mb-4" />
        <div className="h-16 bg-vintage-50 rounded-2xl" />
      </div>
    );
  }

  // Used GB calculation
  const usedGB = (status.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = Math.round(status.storageTotalBytes / (1024 * 1024 * 1024));
  const usagePercent = Math.round((status.storageUsedBytes / status.storageTotalBytes) * 100);

  return (
    <div className="rounded-3xl bg-white border border-vintage-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vintage-100 pb-5">
        <div className="flex items-center gap-3">
          {/* Google One Iconic 4-Color Ring Simulation */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-vintage-200 shadow-2xs flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
            <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-r-red-500 border-b-yellow-500 border-l-green-500 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-stone-700" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
                Google One Cloud Vault
              </span>
              {status.isConnected && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  연동 활성화됨
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-vintage-900 mt-0.5">
              내 구글 드라이브 자동 백업 & 동기화
            </h3>
          </div>
        </div>

        {/* Action Button */}
        {status.isConnected ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-vintage-900 hover:bg-terracotta text-white font-bold text-xs flex items-center gap-2 transition-all shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isSyncing ? '암호화 전송 중...' : '지금 즉시 동기화'}</span>
            </button>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-vintage-300 hover:bg-vintage-50 text-vintage-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="구글 드라이브에서 DASI 폴더 열기"
            >
              <ExternalLink className="w-3.5 h-3.5 text-vintage-500" />
              <span className="hidden sm:inline">드라이브 열기</span>
            </a>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Cloud className="w-4 h-4" />
            <span>Google One 스토리지 연동하기</span>
          </button>
        )}
      </div>

      {status.isConnected ? (
        <div className="space-y-6">
          {/* Storage Quota & Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-vintage-50/70 p-5 rounded-2xl border border-vintage-200/80">
            <div className="md:col-span-5 space-y-1">
              <div className="text-xs text-vintage-500">연결된 구글 계정</div>
              <div className="font-bold text-sm text-vintage-900 font-mono flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{status.email}</span>
              </div>
              <div className="text-[11px] text-vintage-600 font-mono pt-1">
                저장 폴더: <strong>{status.vaultFolderPath}</strong>
              </div>
            </div>

            <div className="md:col-span-7 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-vintage-600 font-bold">{status.storagePlan}</span>
                <span className="text-vintage-800 font-bold">
                  {usedGB} GB 사용 중 / {totalGB} GB ({usagePercent}%)
                </span>
              </div>
              <div className="w-full bg-vintage-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-vintage-500">
                <span>동기화된 파일: 총 {status.syncedFilesCount}개</span>
                <span>최근 동기화: {status.lastSyncedAt || '방금 전'}</span>
              </div>
            </div>
          </div>

          {/* Sync Progress Bar (Active when syncing) */}
          {isSyncing && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between text-xs font-mono text-blue-900 font-bold">
                <span>충무로 16-bit 스캔 원본 및 AI 티켓 구글 드라이브 전송 중...</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 3 Auto-Sync Toggles */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-vintage-500 uppercase tracking-wider">
              자동 백업 및 동기화 항목 설정 (Zero-Password OAuth 2.0)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Toggle 1: Scans */}
              <div
                onClick={() => handleToggleOption('autoBackupScans')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  status.syncOptions.autoBackupScans
                    ? 'border-blue-500/80 bg-blue-50/40'
                    : 'border-vintage-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Film className="w-4 h-4 text-blue-600" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      status.syncOptions.autoBackupScans
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-vintage-300'
                    }`}
                  >
                    {status.syncOptions.autoBackupScans && '✓'}
                  </span>
                </div>
                <div className="font-bold text-xs text-vintage-900">현상소 스캔 원본 자동 백업</div>
                <div className="text-[11px] text-vintage-500 mt-1 leading-tight">
                  스캔 완료 시 4000px 무압축 원본을 내 드라이브로 즉시 전송
                </div>
              </div>

              {/* Toggle 2: Tickets */}
              <div
                onClick={() => handleToggleOption('autoBackupTickets')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  status.syncOptions.autoBackupTickets
                    ? 'border-amber-500/80 bg-amber-50/40'
                    : 'border-vintage-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      status.syncOptions.autoBackupTickets
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-vintage-300'
                    }`}
                  >
                    {status.syncOptions.autoBackupTickets && '✓'}
                  </span>
                </div>
                <div className="font-bold text-xs text-vintage-900">AI 촬영 티켓 & EXIF 일지</div>
                <div className="text-[11px] text-vintage-500 mt-1 leading-tight">
                  발행된 영수증 티켓 이미지와 F값/셔터속도 메타데이터 동기화
                </div>
              </div>

              {/* Toggle 3: Certificates */}
              <div
                onClick={() => handleToggleOption('autoBackupCertificates')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  status.syncOptions.autoBackupCertificates
                    ? 'border-emerald-500/80 bg-emerald-50/40'
                    : 'border-vintage-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      status.syncOptions.autoBackupCertificates
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-vintage-300'
                    }`}
                  >
                    {status.syncOptions.autoBackupCertificates && '✓'}
                  </span>
                </div>
                <div className="font-bold text-xs text-vintage-900">명장 검수 및 정품 보증서</div>
                <div className="text-[11px] text-vintage-500 mt-1 leading-tight">
                  Rent-to-Own 인수 및 명장 오버홀 점검 확인서 PDF 보관
                </div>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer & Disconnect Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-vintage-100 text-xs">
            <div className="flex items-center gap-1.5 text-vintage-500">
              <Lock className="w-3.5 h-3.5 text-vintage-400" />
              <span>Google OAuth 2.0 공식 보안 인증 (DASI 전용 폴더 외 접근 불가)</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-stone-400 hover:text-red-600 text-[11px] underline underline-offset-4 transition-colors"
            >
              구글원 연동 해제
            </button>
          </div>
        </div>
      ) : (
        /* Disconnected State Guide */
        <div className="p-6 rounded-2xl bg-vintage-50/60 border border-vintage-200/80 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-vintage-900">
            비밀번호 입력 없이 안전하게 Google One과 연결하세요
          </h4>
          <p className="text-xs text-vintage-600 max-w-lg mx-auto leading-relaxed">
            DASI는 사용자의 구글 비밀번호를 직접 묻지 않습니다. 구글 공식 보안 창을 통해 안전하게 로그인하시면,
            내 드라이브에 전용 폴더가 생성되어 현상된 고화질 스캔본과 AI 티켓이 실시간 자동 백업됩니다.
          </p>
        </div>
      )}
    </div>
  );
};
