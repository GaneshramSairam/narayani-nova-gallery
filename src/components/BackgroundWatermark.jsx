import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { getStoreWatermark } from '../utils/watermarkConstants';

const BackgroundWatermark = ({ activeStore }) => {
    const { storeWatermarks } = useAdmin();
    const config = getStoreWatermark(storeWatermarks, activeStore);

    if (!config || !config.isEnabled || !config.imageUrl) {
        return null;
    }

    // Determine vertical positioning
    let alignment = 'center';
    let paddingStyle = {};
    if (config.position === 'top') {
        alignment = 'flex-start';
        paddingStyle = { paddingTop: '8vh' };
    } else if (config.position === 'bottom') {
        alignment = 'flex-end';
        paddingStyle = { paddingBottom: '8vh' };
    }

    return (
        <aside
            className="store-background-watermark"
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: alignment,
                justifyContent: 'center',
                ...paddingStyle
            }}
        >
            <div
                className="watermark-inner"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            >
                <img
                    key={`${activeStore}-${config.imageUrl}`}
                    src={config.imageUrl}
                    alt=""
                    className="watermark-img"
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: `${config.scale || 70}vmin`,
                        maxHeight: `${config.scale || 70}vmin`,
                        objectFit: 'contain',
                        opacity: config.opacity !== undefined ? config.opacity : 0.08,
                        transform: `rotate(${config.rotation || 0}deg)`,
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        transition: 'opacity 0.6s ease, transform 0.6s ease'
                    }}
                />
            </div>

            <style>{`
                .store-background-watermark {
                    mix-blend-mode: screen;
                }

                @media (max-width: 768px) {
                    .watermark-img {
                        max-width: 85vmin !important;
                        max-height: 85vmin !important;
                    }
                }
            `}</style>
        </aside>
    );
};

export default BackgroundWatermark;
