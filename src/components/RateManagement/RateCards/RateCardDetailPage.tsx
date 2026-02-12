import { useParams } from "@tanstack/react-router";
import { RateCardDetail } from "./RateCardDetail";

/**
 * RateCardDetailPage - Route component for /rates/rate-cards/$cardId
 * Reads cardId from route params and renders RateCardDetail
 */
export function RateCardDetailPage() {
    const { cardId } = useParams({ from: "/_rates/rates/rate-cards/$cardId" });

    return <RateCardDetail cardId={cardId} />;
}
