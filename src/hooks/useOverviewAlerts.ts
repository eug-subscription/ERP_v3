import { useUpload } from './useUpload';
import { useUnmatchedItems } from './useUnmatchedItems';
import { useShotList } from './useShotList';
import { useModerationEntries } from './useModerationEntries';
import { useMessages } from './useMessages';
import type { OverviewAlert } from '../types/overview';
import type { ShotListItem } from '../types/shot-list';

const MODERATION_REJECTION_RATE_THRESHOLD = 20;

function buildAlerts(params: {
    failedUploads: number;
    remainingMatches: number;
    matchPercent: number;
    rejectedShotItems: number;
    pendingModeration: number;
    unrepliedMessages: number;
    moderationRejectionRate: number;
}): OverviewAlert[] {
    const {
        failedUploads,
        remainingMatches,
        matchPercent,
        rejectedShotItems,
        pendingModeration,
        unrepliedMessages,
        moderationRejectionRate,
    } = params;

    const alerts: OverviewAlert[] = [];

    if (failedUploads > 0) {
        alerts.push({
            id: 'upload-failed',
            severity: 'danger',
            text: `Resolve ${failedUploads} failed upload${failedUploads === 1 ? '' : 's'}`,
            linkTo: '/uploading',
            icon: 'lucide:alert-circle',
        });
    }

    if (remainingMatches > 0) {
        alerts.push({
            id: 'matching-remaining',
            severity: 'warning',
            text: `Match ${remainingMatches} unmatched photo${remainingMatches === 1 ? '' : 's'} (${matchPercent}%)`,
            linkTo: '/items',
            icon: 'lucide:link-2-off',
        });
    }

    if (rejectedShotItems > 0) {
        alerts.push({
            id: 'shot-list-rejected',
            severity: 'warning',
            text: `Review ${rejectedShotItems} rejected shot${rejectedShotItems === 1 ? '' : 's'}`,
            linkTo: '/shot-list',
            icon: 'lucide:x-circle',
        });
    }

    if (pendingModeration > 0) {
        alerts.push({
            id: 'moderation-pending',
            severity: 'default',
            text: `Moderate ${pendingModeration} pending file${pendingModeration === 1 ? '' : 's'}`,
            linkTo: '/moderation',
            icon: 'lucide:eye',
        });
    }

    if (unrepliedMessages > 0) {
        alerts.push({
            id: 'messages-unreplied',
            severity: 'default',
            text: `Reply to ${unrepliedMessages} message${unrepliedMessages === 1 ? '' : 's'}`,
            linkTo: '/messages',
            icon: 'lucide:message-circle',
        });
    }

    if (moderationRejectionRate > MODERATION_REJECTION_RATE_THRESHOLD) {
        const pct = moderationRejectionRate.toFixed(0);
        alerts.push({
            id: 'moderation-rejection-rate',
            severity: 'warning',
            text: `${pct}% moderation rejection rate`,
            linkTo: '/moderation',
            icon: 'lucide:shield-alert',
        });
    }

    return alerts;
}

export function useOverviewAlerts() {
    const { fileCounts, isLoading: uploadLoading } = useUpload();
    const { matchStats, isLoading: matchLoading } = useUnmatchedItems();
    const { data: shotItems, isLoading: shotLoading } = useShotList();
    const { data: moderationEntries, isLoading: moderationLoading } = useModerationEntries();
    const { data: messages, isLoading: messagesLoading } = useMessages();

    const isLoading =
        uploadLoading ||
        matchLoading ||
        shotLoading ||
        moderationLoading ||
        messagesLoading;

    const failedUploads = fileCounts.failed;
    const remainingMatches = matchStats.remaining;
    const matchPercent = matchStats.percent;

    const rejectedShotItems = (shotItems ?? []).filter(
        (item: ShotListItem) => item.status === 'rejected',
    ).length;

    const entries = moderationEntries ?? [];
    const totalModerated = entries.reduce(
        (sum, e) => sum + e.approved + e.rejected,
        0,
    );
    const totalRejected = entries.reduce((sum, e) => sum + e.rejected, 0);
    const moderationRejectionRate =
        totalModerated > 0 ? (totalRejected / totalModerated) * 100 : 0;

    const pendingModeration = entries.reduce(
        (sum, e) => sum + Math.max(0, e.inputFileCount - e.approved - e.rejected),
        0,
    );

    // Count messages from others not followed by a current-user reply
    const msgs = messages ?? [];
    let lastOtherIdx = -1;
    let lastOwnIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
        if (lastOtherIdx === -1 && !msgs[i].isCurrentUser) lastOtherIdx = i;
        if (lastOwnIdx === -1 && msgs[i].isCurrentUser) lastOwnIdx = i;
        if (lastOtherIdx !== -1 && lastOwnIdx !== -1) break;
    }
    const unrepliedMessages = lastOtherIdx > lastOwnIdx
        ? msgs.filter((m, i) => !m.isCurrentUser && i > lastOwnIdx).length
        : 0;

    const alerts = isLoading
        ? []
        : buildAlerts({
            failedUploads,
            remainingMatches,
            matchPercent,
            rejectedShotItems,
            pendingModeration,
            unrepliedMessages,
            moderationRejectionRate,
        });

    return { alerts, isLoading };
}
