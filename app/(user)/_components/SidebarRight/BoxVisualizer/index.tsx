import React, { memo, useCallback } from 'react';

import { StyleControl } from '@/app/(user)/_components/StyleControl';

type BoxStyleProperty = 'borderRadius' | 'shadowIntensity' | 'opacity' | 'showBorder';

interface BoxVisualizerProps {
    borderRadius: number;
    shadowIntensity: number;
    opacity: number;
    showBorder: boolean;
    onStyleChange: (property: BoxStyleProperty, value: number | boolean) => void;
}

export const BoxVisualizer = memo(({ borderRadius, shadowIntensity, opacity, showBorder, onStyleChange }: BoxVisualizerProps) => {
    const handleBorderRadiusChange = useCallback((value: number) => onStyleChange('borderRadius', value), [onStyleChange]);

    const handleShadowIntensityChange = useCallback((value: number) => onStyleChange('shadowIntensity', value), [onStyleChange]);

    const handleOpacityChange = useCallback((value: number) => onStyleChange('opacity', value), [onStyleChange]);

    const handleBorderToggle = useCallback(() => onStyleChange('showBorder', !showBorder), [onStyleChange, showBorder]);

    return (
        <div className='space-y-2'>
            <div className='group relative flex flex-col overflow-hidden rounded-lg p-[1px] transition-all'>
                <div className='relative flex flex-col rounded-lg'>
                    {/* Refined Grid background */}
                    <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]' />

                    <div className='relative flex h-full items-center justify-center bg-black/30 p-8'>
                        {/* Enhanced Preview Box */}
                        <div
                            className='relative h-24 w-24 transition-all duration-300'
                            style={{
                                borderRadius: `${borderRadius}px`,
                                boxShadow: `
                                    inset 0 0 ${shadowIntensity * 50}px rgba(255, 255, 255, ${shadowIntensity * 0.3}),
                                    0 0 20px rgba(255, 255, 255, 0.05)
                                `,
                                backgroundColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
                            }}>
                            <div
                                className='absolute inset-0 transition-all duration-300'
                                style={{
                                    borderRadius: `${borderRadius}px`,
                                    background: `
                                        radial-gradient(circle at center, 
                                            rgba(255, 255, 255, ${opacity * 0.05}),
                                            transparent 70%
                                        )
                                    `,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Controls Container */}
            <div className='space-y-2 rounded-lg bg-black/30 p-4'>
                <StyleControl label='Border Radius' value={borderRadius} onChange={handleBorderRadiusChange} min={0} max={16} step={1} unit='px' />
                <StyleControl label='Shadow Depth' value={shadowIntensity} onChange={handleShadowIntensityChange} min={0} max={1} step={0.05} />
                <StyleControl label='Opacity' value={opacity} onChange={handleOpacityChange} min={0.01} max={1} step={0.05} />

                <div className='flex items-center justify-between px-1 py-2'>
                    <div className='space-y-1'>
                        <span className='font-kodemono text-[10px] font-medium tracking-wider text-white/50 uppercase'>Show Border</span>
                    </div>
                    <button onClick={handleBorderToggle} className={`relative h-6 w-11 rounded-full transition-all duration-300 ${showBorder ? 'bg-white/20' : 'bg-white/[0.03]'}`}>
                        <div
                            className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${
                                showBorder ? 'left-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'left-1 bg-white/50'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
});
