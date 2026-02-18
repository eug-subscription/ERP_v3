import React from "react";

/**
 * Renders text with highlighted search query matches
 * @param text The text to process
 * @param query The search term to highlight
 * @param highlightMatch The function that splits text into parts for highlighting
 * @returns JSX with highlighted portions wrapped in spans
 */
export function renderHighlightedText(
    text: string,
    query: string,
    highlightMatch: (text: string, query: string) => string | string[]
): React.ReactNode {
    const result = highlightMatch(text, query);
    if (typeof result === "string") return result;

    return (
        <>
            {result.map((part, index) =>
                index % 2 === 1 ? (
                    <span key={index} className="bg-warning-200 text-warning-800 rounded-sm px-0.5">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
}
