import { Card, RadioGroup, Radio, Label, Description, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ServiceConfig, Rate, NewRateData, DEFAULT_NEW_RATE } from "../../data/mock-project";
import { RateSelect } from "./RateSelect";
import { NewRetouchingRateForm } from "./NewRetouchingRateForm";
import { CreatedRatesSection } from "./CreatedRatesSection";

interface RetouchingConfigCardProps {
    config: ServiceConfig;
    rates: Rate[];
    onRateModeChange: (rateType: "client", mode: "existing" | "new") => void;
    onNewRateFieldChange: (rateType: "client", field: keyof NewRateData, value: string | number) => void;
    onTypeChange: (type: "ai" | "human") => void;
    onRetoucherRateChange: (rateId: string) => void;
    onNewRetoucherRateFieldChange: (field: keyof NewRateData, value: string | number) => void;
    onAddRate: () => void;
    onRemoveRate: (index: number) => void;
    onUpdateRateIndexed: (index: number, rateId: string) => void;
    onLevelChange: (level: "standard" | "advanced" | "premium") => void;
    onCreateCombinedRate: () => void;
    createdRateIds: string[];
    onEditRate: (rateId: string) => void;
    onDeleteRate: (rateId: string) => void;
}

export function RetouchingConfigCard({
    config,
    rates,
    onRateModeChange,
    onNewRateFieldChange,
    onTypeChange,
    onRetoucherRateChange,
    onNewRetoucherRateFieldChange,
    onAddRate,
    onRemoveRate,
    onUpdateRateIndexed,
    onLevelChange,
    onCreateCombinedRate,
    createdRateIds,
    onEditRate,
    onDeleteRate,
}: RetouchingConfigCardProps) {
    return (
        <Card className="p-0 border border-default-200 shadow-none">
            <Card.Header className="p-6 pb-0">
                <Card.Title className="text-lg font-semibold">Retouching</Card.Title>
                <Card.Description className="text-default-500 text-sm">
                    Professional image retouching and enhancement
                </Card.Description>
            </Card.Header>

            <Card.Content className="p-6 pt-6">
                <div className="space-y-6">
                    <RadioGroup
                        value={config.clientRateMode}
                        onChange={(val) => onRateModeChange("client", val as "existing" | "new")}
                        orientation="horizontal"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        isRequired
                    >
                        <Label className="text-sm font-medium text-default-700 col-span-full">
                            Retouching Rates <span className="text-danger font-semibold ml-0.5">*</span>
                        </Label>
                        <Radio
                            value="existing"
                            className="bg-surface border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                        >
                            <Radio.Control>
                                <Radio.Indicator />
                            </Radio.Control>
                            <Radio.Content>
                                <Label className="font-semibold cursor-pointer text-sm">Use existing rate</Label>
                                <Description className="t-mini text-default-500">
                                    Select from saved rates
                                </Description>
                            </Radio.Content>
                        </Radio>
                        <Radio
                            value="new"
                            className="bg-surface border border-default-200 rounded-xl p-4 m-0 flex-1 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 transition-all cursor-pointer items-center"
                        >
                            <Radio.Control>
                                <Radio.Indicator />
                            </Radio.Control>
                            <Radio.Content>
                                <Label className="font-semibold cursor-pointer text-sm">Create new rate</Label>
                                <Description className="t-mini text-default-500">
                                    Define custom rate
                                </Description>
                            </Radio.Content>
                        </Radio>
                    </RadioGroup>

                    {config.clientRateMode === "existing" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">
                            <div className="space-y-5">
                                <div className="space-y-6 pt-2 w-full md:max-w-[calc(50%-8px)]">
                                    {(config.clientRateIds || [""]).map((rateId, index) => (
                                        <div key={index} className="flex flex-col gap-2">
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1">
                                                    <RateSelect
                                                        label={index === 0 ? "Retouching Rate Name" : "Additional Retouching Rate"}
                                                        rates={rates}
                                                        selectedRateId={rateId}
                                                        onRateChange={(id) => onUpdateRateIndexed(index, id)}
                                                        onCreateNew={() => onRateModeChange("client", "new")}
                                                        isRequired={index === 0}
                                                    />
                                                </div>
                                                {index > 0 && (
                                                    <Button
                                                        variant="tertiary"
                                                        isIconOnly
                                                        onPress={() => onRemoveRate(index)}
                                                        className="h-10 w-10 min-w-10 border border-default-200"
                                                    >
                                                        <Icon icon="lucide:trash-2" className="text-danger" />
                                                    </Button>
                                                )}
                                            </div>
                                            {rateId && (
                                                <div className="t-mini text-default-400 flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-left-1 duration-300">
                                                    <span className="uppercase tracking-wider font-semibold">
                                                        {config.retouchingType === "ai" ? "AI Retouching" : "Human Retouching"}
                                                        {" • "}
                                                        {config.retouchingLevel || "Standard"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        variant="tertiary"
                                        onPress={onAddRate}
                                        className="w-full h-11 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold transition-all rounded-xl mt-2"
                                    >
                                        Add another retouching rate
                                    </Button>
                                </div>

                                {config.retouchingType === "human" && (
                                    <div className="pt-6 border-t border-default-100 space-y-4">
                                        <Label className="text-sm font-semibold text-default-700">
                                            Retoucher Rate
                                        </Label>
                                        <RateSelect
                                            rates={rates}
                                            selectedRateId={config.retoucherRateId}
                                            onRateChange={(id) => onRetoucherRateChange(id)}
                                            onCreateNew={() => onRateModeChange("client", "new")}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-400 space-y-6">
                            {/* Created Retouching Rates - only show when in new mode */}
                            {createdRateIds.filter((id) => config.clientRateIds?.includes(id) || config.retoucherRateId === id).length > 0 && (
                                <CreatedRatesSection
                                    title="Created Retouching Rates"
                                    rates={rates}
                                    createdRateIds={createdRateIds.filter((id) => config.clientRateIds?.includes(id) || config.retoucherRateId === id)}
                                    onEditRate={onEditRate}
                                    onDeleteRate={onDeleteRate}
                                    showTypeInfo={{
                                        type: config.retouchingType || "ai",
                                        level: config.retouchingLevel || "standard",
                                    }}
                                />
                            )}

                            <NewRetouchingRateForm
                                type={config.retouchingType || "ai"}
                                level={config.retouchingLevel || "standard"}
                                clientRate={config.newClientRate || DEFAULT_NEW_RATE}
                                retoucherRate={config.newRetoucherRate || DEFAULT_NEW_RATE}
                                onTypeChange={onTypeChange}
                                onLevelChange={onLevelChange}
                                onClientRateChange={(f, v) => onNewRateFieldChange("client", f, v)}
                                onRetoucherRateChange={onNewRetoucherRateFieldChange}
                                onSubmit={onCreateCombinedRate}
                            />
                        </div>
                    )}
                </div>
            </Card.Content>
        </Card>
    );
}
