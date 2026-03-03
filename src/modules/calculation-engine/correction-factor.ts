// src/modules/calculation-engine/correction-factor.ts
// Adaptive Correction System
// Learns from production feedback using smoothing algorithms

import type { MaterialType, ProductionFeedback } from '../core/types'
import { storage } from '../storage/idb-adapter'

/**
 * Smoothing logic: 
 * newFactor = (oldFactor * 0.7) + (currentBatchAvg * 0.3)
 * This prevents radical swings while allowing the system to adapt.
 */
const SMOOTHING_ALPHA = 0.3 // Weight of new data
const STABILITY_WEIGHT = 0.7 // Weight of historical factor

/**
 * Get all feedback from storage.
 */
export async function getProductionFeedback(materialType?: MaterialType): Promise<ProductionFeedback[]> {
    return storage.getFeedback(materialType)
}

/**
 * Add production feedback results.
 */
export async function addProductionFeedback(
    materialType: MaterialType,
    thickness: number,
    estimatedLength: number,
    actualLength: number
): Promise<void> {
    const feedback: ProductionFeedback = {
        id: Math.random().toString(36).substring(2, 9),
        materialType,
        thickness,
        estimatedLength,
        actualLength,
        timestamp: new Date().toISOString()
    }
    await storage.addFeedback(feedback)
}

/**
 * Calculate the adaptive correction factor for a material type.
 * Uses a rolling average combined with historical stability.
 * 
 * @param materialType - The material type to get factor for
 * @param baseFactor - The current baseline factor (default 1.0)
 * @returns Refined correction factor
 */
export async function getAdaptiveFactor(
    materialType: MaterialType,
    baseFactor: number = 1.0
): Promise<number> {
    const feedbackList = await storage.getFeedback(materialType)

    // Use last 50 entries to avoid ancient data rot
    const recentFeedback = feedbackList.slice(-50)

    if (recentFeedback.length === 0) return baseFactor

    // Calculate average ratio of actual/estimated in the recent batch
    const currentRatios = recentFeedback.map(f => f.actualLength / f.estimatedLength)
    const avgCurrentRatio = currentRatios.reduce((sum, r) => sum + r, 0) / currentRatios.length

    // Learning Formula:
    // newFactor = (Stability * OldFactor) + (Learning * NewData)
    const refinedFactor = (baseFactor * STABILITY_WEIGHT) + (avgCurrentRatio * SMOOTHING_ALPHA)

    // Round to 4 decimal places for precision
    return Math.round(refinedFactor * 10000) / 10000
}

/**
 * Helper for backwards compatibility or high-level retrieval.
 */
export async function getCorrectionFactor(materialType: MaterialType): Promise<number> {
    return getAdaptiveFactor(materialType, 1.0)
}
