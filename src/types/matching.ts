/**
 * Photo-to-item matching types
 */

export interface Photo {
    id: string;
    image: string;
    filename: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    image?: string;
}

export interface MatchStats {
    total: number;
    matched: number;
    remaining: number;
    percent: number;
}
