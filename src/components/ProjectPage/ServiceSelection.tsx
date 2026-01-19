import { Card, Alert } from "@heroui/react";
import { ServiceButton } from "./ServiceButton";
import { allServices } from "../../data/mock-project";

interface ServiceSelectionProps {
    /** List of currently selected service IDs */
    selectedServices: string[];
    /** Callback to toggle service selection */
    onToggleService: (serviceId: string) => void;
    /** Error message to display (e.g., if no services selected) */
    errorMessage?: string | null;
}

/**
 * ServiceSelection component for choosing project services.
 * Groups services into meaningful categories and provides clear visual feedback.
 * Aligned with HeroUI v3 and legacy design requirements.
 */
export function ServiceSelection({
    selectedServices,
    onToggleService,
    errorMessage,
}: ServiceSelectionProps) {
    const photoVideoServices = allServices.filter(s => s.category === "photography-video");
    const otherServices = allServices.filter(s => s.category === "other");

    return (
        <Card className="p-0 border border-default-100 shadow-none rounded-[32px]">
            <Card.Content className="p-8">
                <div className="mb-8">
                    <div className="flex items-center mb-2">
                        <h2 className="text-2xl font-bold text-default-900">Service Selection</h2>
                        <span className="text-danger font-bold ml-1.5">*</span>
                    </div>
                    <p className="text-default-500 text-sm max-w-2xl leading-relaxed">
                        Select one or more services to include in this project. You can select multiple services.
                    </p>
                </div>

                {/* Photography & Video Services */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-default-900 mb-4">
                        Photography & Video
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {photoVideoServices.map((service) => (
                            <ServiceButton
                                key={service.id}
                                icon={service.icon}
                                text={service.label}
                                isSelected={selectedServices.includes(service.id)}
                                onPress={() => onToggleService(service.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Other Services */}
                <div>
                    <h3 className="text-lg font-bold text-default-900 mb-4">
                        Other Services
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {otherServices.map((service) => (
                            <ServiceButton
                                key={service.id}
                                icon={service.icon}
                                text={service.label}
                                isSelected={selectedServices.includes(service.id)}
                                onPress={() => onToggleService(service.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <div className="mt-6">
                        <Alert status="danger">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Description>{errorMessage}</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}
