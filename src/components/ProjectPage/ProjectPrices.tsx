import { ServiceSelection } from "./ServiceSelection";
import { ServiceConfigCard } from "./ServiceConfigCard";
import { RetouchingConfigCard } from "./RetouchingConfigCard";
import { useProjectPage } from "../../hooks/useProjectPage";
import { allServices } from "../../data/mock-project";

export function ProjectPrices() {
    const { state, actions } = useProjectPage();
    const { rates, selectedServices, getServiceConfig, editingRateId, createdRateIds } = state;

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

        </div>
    );
}
