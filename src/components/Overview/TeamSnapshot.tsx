import { Avatar, Card, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { useTeam } from '../../hooks/useTeam';
import { TEXT_SECTION_LABEL } from '../../constants/ui-tokens';
import type { TeamMemberStatus } from '../../types/team';

const TEAM_PREVIEW_COUNT = 4;

const STATUS_DOT_COLOR: Record<TeamMemberStatus, string> = {
    active: 'bg-success',
    paused: 'bg-warning',
    inactive: 'bg-default',
};

export function TeamSnapshot() {
    const { teamMembers, isLoading } = useTeam();

    const activeCount = teamMembers.filter((m) => m.status === 'active').length;
    const pausedCount = teamMembers.filter((m) => m.status === 'paused').length;

    return (
        <Card>
            <Card.Content className="p-5 flex flex-col gap-4">
                {/* ── Header ─────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Icon icon="lucide:users" className="size-4 text-default-500" />
                        <h3 className={TEXT_SECTION_LABEL}>Team</h3>
                    </div>
                    <Link
                        to="/team"
                        className="text-xs text-default-400 hover:text-accent font-medium transition-colors shrink-0"
                    >
                        View Team
                    </Link>
                </div>

                {/* ── Content ────────────────────────────── */}
                {isLoading ? (
                    <div className="flex gap-3">
                        {Array.from({ length: TEAM_PREVIEW_COUNT }).map((_, i) => (
                            <Skeleton key={i} className="size-10 rounded-full shrink-0" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex -space-x-2 flex-wrap gap-y-2">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="relative shrink-0 transition-transform hover:-translate-y-1 hover:z-10">
                                    <Avatar className="ring-2 ring-surface size-10 shadow-sm">
                                        {member.avatarUrl ? (
                                            <Avatar.Image
                                                src={member.avatarUrl}
                                                alt={member.name}
                                            />
                                        ) : null}
                                        <Avatar.Fallback>
                                            {member.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </Avatar.Fallback>
                                    </Avatar>
                                    <span
                                        className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-surface ${STATUS_DOT_COLOR[member.status]}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-default-500 font-medium">
                            <span className="text-default-900 font-semibold">{activeCount}</span> active
                            {pausedCount > 0 ? <span className="text-default-400"> · {pausedCount} paused</span> : ''}
                        </p>
                    </>
                )}
            </Card.Content>
        </Card>
    );
}
