import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Download, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * PWA Install Banner - Shows installation prompt for supported browsers
 */
export function PWAInstallBanner() {
    const { isInstallable, isInstalled, isIOS, isIPad, isMacOS, promptInstall } = usePWA();
    const [isDismissed, setIsDismissed] = React.useState(false);
    const [showIOSGuide, setShowIOSGuide] = React.useState(false);

    // Check if already dismissed in this session
    React.useEffect(() => {
        const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
        if (dismissed) setIsDismissed(true);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem('pwa-banner-dismissed', 'true');
    };

    const handleInstall = async () => {
        if (isIOS || isIPad) {
            setShowIOSGuide(true);
        } else {
            const installed = await promptInstall();
            if (installed) {
                handleDismiss();
            }
        }
    };

    if (isInstalled || isDismissed || !isInstallable) return null;

    return (
        <>
            <div className="pwa-install-banner">
                <div className="pwa-banner-content">
                    <Download size={20} />
                    <div className="pwa-banner-text">
                        <strong>Uygulamayı Kur</strong>
                        <span>
                            {isMacOS
                                ? "Mac'ine kur ve offline kullan"
                                : isIPad
                                    ? "iPad'ine kur ve offline kullan"
                                    : 'Cihazına kur ve offline kullan'}
                        </span>
                    </div>
                </div>
                <div className="pwa-banner-actions">
                    <button onClick={handleInstall} className="pwa-install-btn">
                        Kur
                    </button>
                    <button onClick={handleDismiss} className="pwa-dismiss-btn" aria-label="Kapat">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* iOS Installation Guide Modal */}
            {showIOSGuide && (
                <div className="pwa-ios-guide-overlay" onClick={() => setShowIOSGuide(false)}>
                    <div className="pwa-ios-guide" onClick={(e) => e.stopPropagation()}>
                        <button className="pwa-guide-close" onClick={() => setShowIOSGuide(false)}>
                            <X size={20} />
                        </button>
                        <h3>📱 {isIPad ? "iPad'e" : "iPhone'a"} Kurulum</h3>
                        <ol>
                            <li>
                                Safari'de <strong>Paylaş</strong> butonuna tıkla
                                <span className="ios-share-icon">⬆️</span>
                            </li>
                            <li>
                                Aşağı kaydır ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini bul
                            </li>
                            <li>
                                Sağ üstteki <strong>"Ekle"</strong> butonuna dokun
                            </li>
                        </ol>
                        <p className="pwa-guide-note">
                            Bu işlem sonrasında uygulama ana ekranına eklenir ve tam ekran modunda çalışır.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * PWA Update Banner - Shows when a new version is available
 */
export function PWAUpdateBanner() {
    const { isUpdateAvailable, updateApp } = usePWA();

    if (!isUpdateAvailable) return null;

    return (
        <div className="pwa-update-banner">
            <div className="pwa-banner-content">
                <RefreshCw size={20} />
                <span>Yeni sürüm mevcut!</span>
            </div>
            <button onClick={updateApp} className="pwa-update-btn">
                Güncelle
            </button>
        </div>
    );
}

/**
 * Offline Indicator - Shows when the app is offline
 */
export function OfflineIndicator() {
    const { isOnline } = usePWA();

    if (isOnline) return null;

    return (
        <div className="offline-indicator">
            <WifiOff size={16} />
            <span>Çevrimdışı mod</span>
        </div>
    );
}

/**
 * Online Indicator - Optional, shows connection restored
 */
export function OnlineIndicator() {
    const { isOnline } = usePWA();
    const [showOnline, setShowOnline] = React.useState(false);
    const wasOffline = React.useRef(false);

    React.useEffect(() => {
        if (!isOnline) {
            wasOffline.current = true;
        } else if (wasOffline.current) {
            setShowOnline(true);
            const timer = setTimeout(() => {
                setShowOnline(false);
                wasOffline.current = false;
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!showOnline) return null;

    return (
        <div className="online-indicator">
            <Wifi size={16} />
            <span>Bağlantı kuruldu</span>
        </div>
    );
}
