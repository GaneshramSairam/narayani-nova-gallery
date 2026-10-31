import watermarkJewelsSvg from '../assets/watermark_jewels.svg';
import watermarkDrapesSvg from '../assets/watermark_drapes.svg';

export const DEFAULT_STORE_WATERMARKS = {
    jewels: {
        isEnabled: true,
        imageUrl: watermarkJewelsSvg,
        opacity: 0.08, // 8% subtle translucent opacity
        scale: 70, // 70% scale
        position: 'center', // 'center', 'top', 'bottom'
        rotation: 0 // degrees
    },
    drapes: {
        isEnabled: true,
        imageUrl: watermarkDrapesSvg,
        opacity: 0.08,
        scale: 70,
        position: 'center',
        rotation: 0
    }
};

/**
 * Merges stored watermark configuration with defaults
 */
export const getStoreWatermark = (settings, storeKey) => {
    const key = storeKey === 'drapes' ? 'drapes' : 'jewels';
    const baseDefault = DEFAULT_STORE_WATERMARKS[key];
    const userConfig = settings?.[key];

    if (!userConfig) {
        return baseDefault;
    }

    return {
        isEnabled: userConfig.isEnabled !== undefined ? userConfig.isEnabled : baseDefault.isEnabled,
        imageUrl: userConfig.imageUrl || baseDefault.imageUrl,
        opacity: userConfig.opacity !== undefined ? Number(userConfig.opacity) : baseDefault.opacity,
        scale: userConfig.scale !== undefined ? Number(userConfig.scale) : baseDefault.scale,
        position: userConfig.position || baseDefault.position,
        rotation: userConfig.rotation !== undefined ? Number(userConfig.rotation) : baseDefault.rotation
    };
};

/**
 * Validates uploaded image file
 */
export const validateWatermarkImage = (file) => {
    if (!file) {
        return { valid: false, error: 'No file provided.' };
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only PNG, JPEG, WEBP, or SVG images are supported.' };
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        return { valid: false, error: 'Image file size must be less than 2MB.' };
    }
    return { valid: true };
};
