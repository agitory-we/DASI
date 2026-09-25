/**
 * 카카오톡 1초 공유 유틸리티
 * 
 * 애플 수석 디자이너 관점: 유려한 소셜 바이럴 공유 경험
 * 키: NEXT_PUBLIC_KAKAO_JS_KEY
 */

declare global {
  interface Window {
    Kakao?: any;
  }
}

export function initKakao(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.Kakao) return false;

  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'bf5b083344f7b2086e164f691880c267';
  if (!window.Kakao.isInitialized()) {
    try {
      window.Kakao.init(jsKey);
    } catch (e) {
      console.warn('[Kakao Share] init failed:', e);
      return false;
    }
  }
  return window.Kakao.isInitialized();
}

/**
 * 카카오톡으로 현상소/출사지/쿠폰 공유하기
 */
export function shareViaKakaoTalk(options: {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonTitle?: string;
}): boolean {
  if (typeof window === 'undefined') return false;

  const initialized = initKakao();
  const targetUrl = options.linkUrl || window.location.href;
  const image = options.imageUrl || `${window.location.origin}/icons/dasi_camera_icon.png`;

  if (initialized && window.Kakao?.Share) {
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: options.title,
          description: options.description,
          imageUrl: image,
          link: {
            mobileWebUrl: targetUrl,
            webUrl: targetUrl,
          },
        },
        buttons: [
          {
            title: options.buttonTitle || 'DASI에서 보기',
            link: {
              mobileWebUrl: targetUrl,
              webUrl: targetUrl,
            },
          },
        ],
      });
      return true;
    } catch (err) {
      console.warn('[Kakao Share] sendDefault error:', err);
    }
  }

  // Fallback: Web Share API 또는 클립보드 복사
  if (navigator.share) {
    navigator
      .share({
        title: options.title,
        text: options.description,
        url: targetUrl,
      })
      .catch(() => {});
    return true;
  }

  return false;
}
