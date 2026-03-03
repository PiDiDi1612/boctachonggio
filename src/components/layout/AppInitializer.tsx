// src/components/layout/AppInitializer.tsx
'use client'

import { useEffect } from 'react'
import { getSettings } from '@/lib/storage'
import { initAIFromSettings } from '@/modules/parse-engine'

/**
 * Global initializer for client-side logic.
 * Handles AI strategy configuration on app start.
 */
export function AppInitializer() {
    useEffect(() => {
        // Run once on mount
        const settings = getSettings()
        initAIFromSettings(settings)
        console.log('[AppInitializer] AI Strategy initialized:', settings.aiEnabled ? `ON (${settings.aiModel})` : 'OFF (Regex)')
    }, [])

    return null // Purely functional component
}
