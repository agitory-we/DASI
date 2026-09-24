import { NextRequest, NextResponse } from 'next/server';
import { fetchPhotoGalleryList, searchPhotoGallery } from '@/lib/photoGalleryApi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const pageNo = parseInt(searchParams.get('pageNo') || '1', 10);
    const numOfRows = parseInt(searchParams.get('numOfRows') || '24', 10);
    const arrange = (searchParams.get('arrange') as 'A' | 'B' | 'C') || 'B';

    let items;
    if (keyword && keyword.trim()) {
      items = await searchPhotoGallery({
        keyword,
        pageNo,
        numOfRows,
        arrange,
      });
    } else {
      items = await fetchPhotoGalleryList({
        pageNo,
        numOfRows,
        arrange,
      });
    }

    return NextResponse.json({
      items,
      count: items.length,
      source: 'knto_photo_gallery',
    });
  } catch (err) {
    console.error('[/api/gallery] 에러:', err);
    return NextResponse.json({ items: [], error: String(err) }, { status: 500 });
  }
}
