import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface GoogleDriveStatusResponse {
  isConnected: boolean;
  email: string | null;
  storageUsedBytes: number;
  storageTotalBytes: number;
  storagePlan: string;
  vaultFolderId: string;
  vaultFolderPath: string;
  lastSyncedAt: string | null;
  syncedFilesCount: number;
  syncOptions: {
    autoBackupScans: boolean;
    autoBackupTickets: boolean;
    autoBackupCertificates: boolean;
  };
}

// In-memory / server state simulation (Google Architect Fact-Grounded Pattern)
let currentStatus: GoogleDriveStatusResponse = {
  isConnected: true,
  email: 'story.analog@gmail.com',
  storageUsedBytes: 42.8 * 1024 * 1024 * 1024, // 42.8 GB
  storageTotalBytes: 100 * 1024 * 1024 * 1024, // 100 GB (Google One Basic)
  storagePlan: 'Google One (100 GB)',
  vaultFolderId: 'folder_dasi_vault_2026',
  vaultFolderPath: '내 드라이브 > DASI_Analog_Vault',
  lastSyncedAt: '2026-10-03 21:30',
  syncedFilesCount: 74, // 72 photos from 2 rolls + 2 tickets
  syncOptions: {
    autoBackupScans: true,
    autoBackupTickets: true,
    autoBackupCertificates: true,
  },
};

export async function GET() {
  return NextResponse.json(currentStatus);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, options } = body;

    if (action === 'connect') {
      currentStatus = {
        ...currentStatus,
        isConnected: true,
        email: body.email || 'story.analog@gmail.com',
        lastSyncedAt: new Date().toLocaleString('ko-KR'),
      };
      return NextResponse.json({ success: true, status: currentStatus });
    }

    if (action === 'disconnect') {
      currentStatus = {
        ...currentStatus,
        isConnected: false,
        email: null,
      };
      return NextResponse.json({ success: true, status: currentStatus });
    }

    if (action === 'update_options') {
      currentStatus.syncOptions = {
        ...currentStatus.syncOptions,
        ...options,
      };
      return NextResponse.json({ success: true, status: currentStatus });
    }

    if (action === 'sync_now') {
      // Simulate live encryption & upload of pending scans and AI tickets
      const newlyUploaded = 36;
      currentStatus.syncedFilesCount += newlyUploaded;
      currentStatus.storageUsedBytes += newlyUploaded * 18 * 1024 * 1024; // ~18MB per photo
      currentStatus.lastSyncedAt = new Date().toLocaleString('ko-KR');

      return NextResponse.json({
        success: true,
        uploadedCount: newlyUploaded,
        status: currentStatus,
        message: `${newlyUploaded}장의 고화질 사진 및 AI 티켓이 구글 드라이브로 안전하게 전송되었습니다.`,
      });
    }

    return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
  } catch (err) {
    console.error('[Google Drive API Error]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
