import { CONNECTION_LINE_HEIGHT, CONNECTION_LINE_WIDTH } from "../constants";

interface ConnectionLineProps {
    /** Whether to animate the flow particles */
    animated?: boolean;
    /** Standard vertical line or curved branch line */
    variant?: 'vertical' | 'curved';
    /** Height of the vertical segment in pixels */
    height?: number;
    /** Optional custom stroke color */
    color?: string;
    /** If variant is curved, which direction */
    curveDirection?: 'left' | 'right';
    className?: string;
}

export function ConnectionLine({
    animated = true,
    variant = 'vertical',
    height = CONNECTION_LINE_HEIGHT,
    color = 'var(--color-cat-asset)', // Default gray for neutral connections
    curveDirection = 'right',
    className = ""
}: ConnectionLineProps) {
    // Unified line thickness from constants
    const width = CONNECTION_LINE_WIDTH;

    // Using CSS animations (defined in index.css) for draw effects and particle flow.
    // This provides better performance and maintenance than complex SVG-in-JS animations.

    if (variant === 'vertical') {
        return (
            <div
                className={`relative flex justify-center items-center w-8 ${className}`}
                style={{ height }}
                aria-hidden="true"
            >
                {/* 
                    CR-011: Using SVG for vertical lines to ensure identical rendering 
                    to the curved branch lines.
                */}
                <svg width="32" height={height} viewBox={`0 0 32 ${height}`} className="overflow-visible">
                    <line
                        x1="16"
                        y1="0"
                        x2="16"
                        y2={height}
                        stroke={color}
                        strokeWidth={width}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Animated Flow Dot */}
                {animated && (
                    <div
                        className="absolute w-[6px] h-[6px] rounded-full bg-primary shadow-sm animate-flow-vertical left-1/2 -translate-x-1/2"
                        style={{
                            ['--flow-height' as string]: `${height}px`,
                            top: 0,
                        } as React.CSSProperties}
                    />
                )}
            </div>
        );
    }

    // Curved variant for branching logic (Phase 3 extension, simplified now)
    return (
        <div className={`relative h-8 w-1/2 border-default-300 ${className}`} style={{ borderColor: color }}>
            {/* Curved Path Placeholder based on direction */}
            <svg
                width="100%"
                height={height}
                className="overflow-visible"
                aria-hidden="true"
            >
                <path
                    d={curveDirection === 'right'
                        ? `M 0 0 Q 0 ${height / 2} ${height} ${height / 2} T ${height * 2} ${height}`
                        : `M ${height * 2} 0 Q ${height * 2} ${height / 2} ${height} ${height / 2} T 0 ${height}`
                    }
                    fill="none"
                    stroke={color}
                    strokeWidth={width}
                />
            </svg>
        </div>
    );
}
