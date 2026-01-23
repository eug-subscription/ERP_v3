import { useState, useEffect } from 'react';
import { CanvasBlock, ValidationResult } from '../types/workflow';
import { validateCanvasBlocks } from '../data/block-dependencies';

/**
 * Hook for real-time validation of canvas blocks with debounce for performance.
 * 
 * @param blocks The current blocks on the canvas
 * @param debounceMs Delay in milliseconds before running validation (default: 500)
 * @returns The validation result containing overall status and specific errors
 */
export function useBlockValidation(blocks: CanvasBlock[], debounceMs = 500) {
    const [validationResult, setValidationResult] = useState<ValidationResult>({
        isValid: true,
        errors: []
    });

    useEffect(() => {
        // Debounce validation to prevent excessive processing on rapid changes (like reordering)
        const timer = setTimeout(() => {
            const result = validateCanvasBlocks(blocks);
            setValidationResult(result);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [blocks, debounceMs]);

    return validationResult;
}
