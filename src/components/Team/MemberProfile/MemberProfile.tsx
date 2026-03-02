import React, { Suspense } from "react";
import { Alert, Spinner, Surface, Tabs } from "@heroui/react";
import { useTeamMember } from "../../../hooks/useTeamMember";
import { TAB_PANEL_SURFACE } from "../../../constants/ui-tokens";
import { ProfileHeader } from "./ProfileHeader";
import { MemberProfileSkeleton } from "./MemberProfileSkeleton";

// Lazy-loaded tab panels — each becomes its own chunk, loaded on first tab switch.
const DetailsTab = React.lazy(() =>
    import("./DetailsTab").then(m => ({ default: m.DetailsTab }))
);
const RolesPermissionsTab = React.lazy(() =>
    import("./RolesPermissionsTab").then(m => ({ default: m.RolesPermissionsTab }))
);
const PasswordTab = React.lazy(() =>
    import("./PasswordTab").then(m => ({ default: m.PasswordTab }))
);
const PaymentsTab = React.lazy(() =>
    import("./PaymentsTab").then(m => ({ default: m.PaymentsTab }))
);
const NotificationsTab = React.lazy(() =>
    import("./NotificationsTab").then(m => ({ default: m.NotificationsTab }))
);

interface MemberProfileProps {
    memberId: string;
}

/**
 * MemberProfile — Profile shell for a single team member.
 *
 * Responsibilities:
 * - Fetches profile data via useTeamMember
 * - Shows MemberProfileSkeleton during loading
 * - Renders ProfileHeader + 5-tab navigation
 * - Routes each tab panel to its dedicated tab component
 */
export function MemberProfile({ memberId }: MemberProfileProps) {
    const { data: profile, isLoading, error } = useTeamMember(memberId);

    if (error) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Failed to load profile</Alert.Title>
                        <Alert.Description>
                            We couldn't retrieve this member's profile. Please go back and try again.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            </div>
        );
    }

    if (isLoading || !profile) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <MemberProfileSkeleton />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fadeIn">
            <ProfileHeader profile={profile} />

            <Tabs defaultSelectedKey="details" className="w-full mt-8">
                <Tabs.ListContainer>
                    <Tabs.List
                        aria-label="Profile sections"
                        className="*:data-[selected=true]:font-semibold *:font-normal"
                    >
                        <Tabs.Tab id="details">
                            My Details
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="roles">
                            Roles &amp; Permissions
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="password">
                            Password
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="payments">
                            Payments
                            <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="notifications">
                            Notifications
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="details">
                    <Surface variant="secondary" className={TAB_PANEL_SURFACE}>
                        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="sm" aria-label="Loading tab" /></div>}>
                            <DetailsTab profile={profile} />
                        </Suspense>
                    </Surface>
                </Tabs.Panel>

                <Tabs.Panel id="roles">
                    <Surface variant="secondary" className={TAB_PANEL_SURFACE}>
                        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="sm" aria-label="Loading tab" /></div>}>
                            <RolesPermissionsTab profile={profile} />
                        </Suspense>
                    </Surface>
                </Tabs.Panel>

                <Tabs.Panel id="password">
                    <Surface variant="secondary" className={TAB_PANEL_SURFACE}>
                        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="sm" aria-label="Loading tab" /></div>}>
                            <PasswordTab profile={profile} />
                        </Suspense>
                    </Surface>
                </Tabs.Panel>

                <Tabs.Panel id="payments">
                    <Surface variant="secondary" className={TAB_PANEL_SURFACE}>
                        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="sm" aria-label="Loading tab" /></div>}>
                            <PaymentsTab profile={profile} />
                        </Suspense>
                    </Surface>
                </Tabs.Panel>

                <Tabs.Panel id="notifications">
                    <Surface variant="secondary" className={TAB_PANEL_SURFACE}>
                        <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="sm" aria-label="Loading tab" /></div>}>
                            <NotificationsTab profile={profile} />
                        </Suspense>
                    </Surface>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}
