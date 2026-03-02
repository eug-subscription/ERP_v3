import { useParams } from "@tanstack/react-router";
import { MemberProfile } from "./MemberProfile";

/**
 * MemberProfilePage — Route component for /people/$memberId.
 * Reads memberId from route params and delegates to MemberProfile.
 */
export function MemberProfilePage() {
    const { memberId } = useParams({ from: "/_team/people/$memberId" });

    return <MemberProfile memberId={memberId} />;
}
