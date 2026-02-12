import { ComingSoonPage } from "./ComingSoonPage";

// Stable component wrappers for ComingSoonPage to avoid remounting
// These are separated per react-refresh/only-export-components requirement
export function AccountComingSoon() {
    return <ComingSoonPage feature="Account Details" />;
}

export function NotificationsComingSoon() {
    return <ComingSoonPage feature="Notifications" />;
}

export function SecurityComingSoon() {
    return <ComingSoonPage feature="Security" />;
}

export function ManagersComingSoon() {
    return <ComingSoonPage feature="Managers" />;
}

export function GuidelinesComingSoon() {
    return <ComingSoonPage feature="Guidelines" />;
}

export function SettingsComingSoon() {
    return <ComingSoonPage feature="Settings" />;
}
