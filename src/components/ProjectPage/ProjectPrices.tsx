import { ServiceSelection } from "./ServiceSelection";
import { ServiceConfigCard } from "./ServiceConfigCard";
import { RetouchingConfigCard } from "./RetouchingConfigCard";
import { useProjectPage } from "../../hooks/useProjectPage";
import { allServices } from "../../data/mock-project";
import { Alert, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";

export function ProjectPrices() {
    const { state, actions } = useProjectPage();
    const { rates, selectedServices, getServiceConfig, toasts, editingRateId, createdRateIds } = state;

    return (
        <div className="space-y-6">
            <ServiceSelection
                selectedServices={selectedServices}
                onToggleService={actions.toggleServiceSelection}
                errorMessage={selectedServices.length === 0 ? "Please select at least one service." : null}
            />

            {/* Special Case: Professional Photography */}
            {selectedServices.includes("professional-photography") && (
                <ServiceConfigCard
                    title="Professional Photography"
                    description="Professional photography services for your project"
                    config={getServiceConfig("professional-photography")}
                    rates={rates}
                    onUpdateRate={(type, id) => actions.updateRate("professional-photography", type, id)}
                    onRateModeChange={(type, mode) => actions.updateRateMode("professional-photography", type, mode)}
                    onNewRateFieldChange={(type, field, val) => actions.updateNewRateField("professional-photography", type, field, val)}
                    onCreateRate={(type) => actions.createRate("professional-photography", type)}
                    createdRateIds={createdRateIds}
                    onEditRate={(type, rateId) => actions.startEditRate("professional-photography", type, rateId)}
                    onSaveEdit={(type) => actions.saveEditedRate("professional-photography", type)}
                    onCancelEdit={(type) => actions.cancelEdit("professional-photography", type)}
                    onDeleteRate={actions.deleteCreatedRate}
                    isEditing={!!editingRateId}
                    showProviderRate={true}
                />
            )}

            {/* Special Case: Professional Videography */}
            {selectedServices.includes("professional-videography") && (
                <ServiceConfigCard
                    title="Professional Videography"
                    description="Professional video production services"
                    config={getServiceConfig("professional-videography")}
                    rates={rates}
                    onUpdateRate={(type, id) => actions.updateRate("professional-videography", type, id)}
                    onRateModeChange={(type, mode) => actions.updateRateMode("professional-videography", type, mode)}
                    onNewRateFieldChange={(type, field, val) => actions.updateNewRateField("professional-videography", type, field, val)}
                    onCreateRate={(type) => actions.createRate("professional-videography", type)}
                    createdRateIds={createdRateIds}
                    onEditRate={(type, rateId) => actions.startEditRate("professional-videography", type, rateId)}
                    onSaveEdit={(type) => actions.saveEditedRate("professional-videography", type)}
                    onCancelEdit={(type) => actions.cancelEdit("professional-videography", type)}
                    onDeleteRate={actions.deleteCreatedRate}
                    isEditing={!!editingRateId}
                    showProviderRate={true}
                />
            )}

            {/* Special Case: Retouching */}
            {selectedServices.includes("retouching") && (
                <RetouchingConfigCard
                    config={getServiceConfig("retouching")}
                    rates={rates}
                    onRateModeChange={(type, mode) => actions.updateRateMode("retouching", type, mode)}
                    onNewRateFieldChange={(type, field, val) => actions.updateNewRateField("retouching", type, field, val)}
                    onTypeChange={actions.updateRetouchingType}
                    onRetoucherRateChange={actions.updateRetoucherRate}
                    onNewRetoucherRateFieldChange={actions.updateNewRetoucherRateField}
                    onAddRate={actions.addRetouchingRate}
                    onRemoveRate={actions.removeRetouchingRate}
                    onUpdateRateIndexed={actions.updateRetouchingRate}
                    onLevelChange={actions.updateRetouchingLevel}
                    onCreateCombinedRate={actions.createCombinedRetouchingRate}
                    createdRateIds={createdRateIds}
                    onEditRate={(rateId) => actions.startEditRate("retouching", "client", rateId)}
                    onDeleteRate={actions.deleteCreatedRate}
                />
            )}

            {/* General Case: All other selected services (Client-Only) */}
            {selectedServices
                .filter(id => !["professional-photography", "professional-videography", "retouching"].includes(id))
                .map(id => {
                    const service = allServices.find(s => s.id === id);
                    if (!service) return null;

                    return (
                        <ServiceConfigCard
                            key={id}
                            title={service.label}
                            description={`${service.label} services for your project`}
                            config={getServiceConfig(id)}
                            rates={rates}
                            onUpdateRate={(type, rateId) => actions.updateRate(id, type, rateId)}
                            onRateModeChange={(type, mode) => actions.updateRateMode(id, type, mode)}
                            onNewRateFieldChange={(type, field, val) => actions.updateNewRateField(id, type, field, val)}
                            onCreateRate={(type) => actions.createRate(id, type)}
                            createdRateIds={createdRateIds}
                            onEditRate={(type, rateId) => actions.startEditRate(id, type, rateId)}
                            onSaveEdit={(type) => actions.saveEditedRate(id, type)}
                            onCancelEdit={(type) => actions.cancelEdit(id, type)}
                            onDeleteRate={actions.deleteCreatedRate}
                            isEditing={!!editingRateId}
                            showProviderRate={false}
                        />
                    );
                })}

            {/* Global Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 min-w-[320px] max-w-md pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <Alert
                                status={toast.status}
                                className="shadow-2xl border-divider/50 backdrop-blur-xl bg-content1/80 relative pr-12"
                            >
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title className="text-sm font-bold">{toast.title}</Alert.Title>
                                    {toast.description && (
                                        <Alert.Description className="text-xs opacity-90 text-pretty">
                                            {toast.description}
                                        </Alert.Description>
                                    )}
                                </Alert.Content>
                                <div className="absolute top-2 right-2">
                                    <Button
                                        isIconOnly
                                        variant="ghost"
                                        size="sm"
                                        onPress={() => actions.removeToast(toast.id)}
                                        className="h-8 w-8 min-w-0"
                                    >
                                        <Icon icon="lucide:x" width={14} />
                                    </Button>
                                </div>
                            </Alert>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
