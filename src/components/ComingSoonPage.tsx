interface ComingSoonPageProps {
    feature: string;
}

export function ComingSoonPage({ feature }: ComingSoonPageProps) {
    return (
        <div className="p-8 text-center text-default-500">
            {feature} (Coming Soon)
        </div>
    );
}
