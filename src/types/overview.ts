export type AlertSeverity = 'danger' | 'warning' | 'default';

export interface OverviewAlert {
    id: string;
    severity: AlertSeverity;
    text: string;
    linkTo: string;
    icon: string;
}
