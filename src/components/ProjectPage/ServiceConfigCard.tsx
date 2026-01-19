import { Card, RadioGroup, Radio, Label, Description } from "@heroui/react";
import { ServiceConfig, Rate, NewRateData, DEFAULT_NEW_RATE } from "../../data/mock-project";
import { RateSelect } from "./RateSelect";
import { NewRateForm } from "./NewRateForm";
import { CreatedRatesSection } from "./CreatedRatesSection";

interface ServiceConfigCardProps {
    title: string;
    description: string;
    config: ServiceConfig;
    rates: Rate[];
    onUpdateRate: (rateType: "client" | "provider", rateId: string) => void;
    onToggle?: () => void;
    onRateModeChange: (rateType: "client" | "provider", mode: "existing" | "new") => void;
    onNewRateFieldChange: (rateType: "client" | "provider", field: keyof NewRateData, value: string | number) => void;
    onCreateRate: (rateType: "client" | "provider") => void;
    createdRateIds: string[];
    onEditRate: (rateType: "client" | "provider", rateId: string) => void;
    onSaveEdit: (rateType: "client" | "provider") => void;
    onCancelEdit: (rateType: "client" | "provider") => void;
    onDeleteRate: (rateId: string) => void;
    isEditing?: boolean;
    /** Whether to show the provider/photographer rate section. Defaults to true. */
    showProviderRate?: boolean;
}

export function ServiceConfigCard({
    title,
    description,
    config,
    rates,
    onUpdateRate,
    onRateModeChange,
    onNewRateFieldChange,
    onCreateRate,
    createdRateIds,
    onEditRate,
    onSaveEdit,
    onCancelEdit,
    onDeleteRate,
    isEditing = false,
    showProviderRate = true,
}: ServiceConfigCardProps) {
    // Filter created rates for client and provider
    const createdClientRates = rates.filter(
        (r) => createdRateIds.includes(r.id) && config.clientRateIds?.includes(r.id)
    );
    const createdProviderRates = rates.filter(
        (r) => createdRateIds.includes(r.id) && config.providerRateId === r.id
    );

    return (
        <Card className="p-0 border border-default-200 shadow-none">
            <Card.Header className="p-6 pb-0">
                <Card.Title className="text-lg font-semibold">{title}</Card.Title>
                <Card.Description className="text-default-500 text-sm">{description}</Card.Description>
            </Card.Header>
            <Card.Content className="p-6 pt-6">
                {/* Client Rate Section */}
                <div className={showProviderRate ? "mb-10" : "mb-0"}>
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-default-700">
                            Client Rate <span className="text-danger font-semibold ml-0.5">*</span>
                        </Label>
                        <RadioGroup
                            value={config.clientRateMode}
                            onChange={(val) => onRateModeChange("client", val as "existing" | "new")}
                            orientation="horizontal"
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            isRequired
                        >
                            <Radio
                                value="existing"
                                className="bg-content1 border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                            >
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label className="font-semibold cursor-pointer text-sm">Use existing rate</Label>
                                    <Description className="text-[10px] text-default-500">
                                        Select from saved rates
                                    </Description>
                                </Radio.Content>
                            </Radio>
                            <Radio
                                value="new"
                                className="bg-content1 border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                            >
                                <Radio.Control>
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content>
                                    <Label className="font-semibold cursor-pointer text-sm">Create new rate</Label>
                                    <Description className="text-[10px] text-default-500">
                                        Define custom rate
                                    </Description>
                                </Radio.Content>
                            </Radio>
                        </RadioGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.clientRateMode === "existing" ? (
                                <div className="col-span-1">
                                    <RateSelect
                                        label="Select rate"
                                        rates={rates}
                                        selectedRateId={config.clientRateIds?.[0]}
                                        onRateChange={(id) => onUpdateRate("client", id)}
                                        onCreateNew={() => onRateModeChange("client", "new")}
                                        isRequired
                                    />
                                </div>
                            ) : (
                                <div className="col-span-full">
                                    <NewRateForm
                                        rateType="client"
                                        value={config.newClientRate || DEFAULT_NEW_RATE}
                                        onChange={(field, value) => onNewRateFieldChange("client", field, value)}
                                        onSubmit={() => isEditing ? onSaveEdit("client") : onCreateRate("client")}
                                        onCancel={isEditing ? () => onCancelEdit("client") : undefined}
                                        label="Client Rate Name"
                                        isEditing={isEditing}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Created Client Rates - only show when in new mode */}
                        {config.clientRateMode === "new" && createdClientRates.length > 0 && (
                            <div className="mt-4">
                                <CreatedRatesSection
                                    title="Created Client Rates"
                                    rates={rates}
                                    createdRateIds={createdRateIds.filter((id) => config.clientRateIds?.includes(id))}
                                    onEditRate={(rateId) => onEditRate("client", rateId)}
                                    onDeleteRate={onDeleteRate}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Provider Rate Section (Optional) */}
                {showProviderRate && (
                    <div className="mb-0">
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-default-700">
                                {config.type === "professional-photography"
                                    ? "Photographer Rate"
                                    : "Videographer Rate"}{" "}
                                <span className="text-danger font-semibold ml-0.5">*</span>
                            </Label>
                            <RadioGroup
                                value={config.providerRateMode}
                                onChange={(val) => onRateModeChange("provider", val as "existing" | "new")}
                                orientation="horizontal"
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                isRequired
                            >
                                <Radio
                                    value="existing"
                                    className="bg-content1 border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                                >
                                    <Radio.Control>
                                        <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content>
                                        <Label className="font-semibold cursor-pointer text-sm">Use existing rate</Label>
                                        <Description className="text-[10px] text-default-500">
                                            Select from saved rates
                                        </Description>
                                    </Radio.Content>
                                </Radio>
                                <Radio
                                    value="new"
                                    className="bg-content1 border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                                >
                                    <Radio.Control>
                                        <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content>
                                        <Label className="font-semibold cursor-pointer text-sm">Create new rate</Label>
                                        <Description className="text-[10px] text-default-500">
                                            Define custom rate
                                        </Description>
                                    </Radio.Content>
                                </Radio>
                            </RadioGroup>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {config.providerRateMode === "existing" ? (
                                    <div className="col-span-1">
                                        <RateSelect
                                            label="Select rate"
                                            rates={rates}
                                            selectedRateId={config.providerRateId}
                                            onRateChange={(id) => onUpdateRate("provider", id)}
                                            onCreateNew={() => onRateModeChange("provider", "new")}
                                            isRequired
                                        />
                                    </div>
                                ) : (
                                    <div className="col-span-full">
                                        <NewRateForm
                                            rateType="provider"
                                            value={config.newProviderRate || DEFAULT_NEW_RATE}
                                            onChange={(field, value) => onNewRateFieldChange("provider", field, value)}
                                            onSubmit={() => isEditing ? onSaveEdit("provider") : onCreateRate("provider")}
                                            onCancel={isEditing ? () => onCancelEdit("provider") : undefined}
                                            label={config.type === "professional-photography" ? "Photographer Rate Name" : "Videographer Rate Name"}
                                            isEditing={isEditing}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Created Provider Rates - only show when in new mode */}
                            {config.providerRateMode === "new" && createdProviderRates.length > 0 && (
                                <div className="mt-4">
                                    <CreatedRatesSection
                                        title={config.type === "professional-photography" ? "Created Photographer Rates" : "Created Videographer Rates"}
                                        rates={rates}
                                        createdRateIds={config.providerRateId && createdRateIds.includes(config.providerRateId) ? [config.providerRateId] : []}
                                        onEditRate={(rateId) => onEditRate("provider", rateId)}
                                        onDeleteRate={onDeleteRate}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}
