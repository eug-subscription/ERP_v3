import { Tabs, Button, Breadcrumbs, Surface } from "@heroui/react";
import { Icon } from "@iconify/react";
import { RateItemsList } from "./RateItems/RateItemsList";
import { RateItemModal } from "./RateItems/RateItemModal";
import { RateCardsList } from "./RateCards/RateCardsList";
import { RateCardCreateModal } from "./RateCards/RateCardCreateModal";
import { ModifierCodesList } from "./ModifierCodes/ModifierCodesList";
import { ModifierCodeModal } from "./ModifierCodes/ModifierCodeModal";
import { useRateManagementPage } from "../../hooks/useRateManagementPage";

const TABS = [
    {
        id: "rate-items",
        label: "Rate Items",
        description: "Global building blocks for your pricing structure. Define fundamental units like 'Photographer Hour' or 'Retouched Photo' without assigning specific prices."
    },
    {
        id: "rate-cards",
        label: "Rate Cards",
        description: "Market-specific value packages. Assign monetary costs and client rates to Rate Items for specific currencies and regional segments."
    },
    {
        id: "modifier-codes",
        label: "Modifier Codes",
        description: "Define reusable modifier codes for operational adjustments (rush, weekend, complexity)."
    },
];

/**
 * RateManagementPage - Central admin interface for managing the pricing catalog.
 * Manages tab navigation and shared entity modals (Rate Items, Rate Cards, Modifier Codes).
 */
export function RateManagementPage() {
    const {
        activeTab,
        handleTabChange,
        rateItemModal,
        rateItemActions,
        rateCardModal,
        rateCardActions,
        modifierCodeModal,
        modifierCodeActions
    } = useRateManagementPage();

    return (
        <Surface className="min-h-screen bg-surface rounded-none shadow-none pb-20 p-12">
            {/* Avant-Garde Header Section */}
            <header className="mb-10 px-0">
                <Breadcrumbs className="mb-4">
                    <Breadcrumbs.Item>Administration</Breadcrumbs.Item>
                    <Breadcrumbs.Item>Pricing Catalog</Breadcrumbs.Item>
                </Breadcrumbs>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Pricing Catalog</h1>
                        <p className="text-default-500 max-w-2xl text-lg min-h-[56px]">
                            {TABS.find(t => t.id === activeTab)?.description || "Configure global rate items, build regional rate cards, and define standard billing line types."}
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        onPress={
                            activeTab === "rate-items" ? rateItemActions.onAdd :
                                activeTab === "rate-cards" ? rateCardActions.onAdd :
                                    modifierCodeActions.onAdd
                        }
                    >
                        <Icon icon="lucide:plus" className="w-5 h-5 mr-1" />
                        {activeTab === "rate-items" && "Add Rate Item"}
                        {activeTab === "rate-cards" && "Create Rate Card"}
                        {activeTab === "modifier-codes" && "Add Modifier"}
                    </Button>
                </div>
            </header>

            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => handleTabChange(key as string)}
                className="mb-8"
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Pricing management tabs" className="bg-default-100/50 p-1 rounded-2xl flex flex-wrap md:flex-nowrap w-fit gap-1">
                        {TABS.map((tab) => (
                            <Tabs.Tab
                                key={tab.id}
                                id={tab.id}
                                className="h-10 px-6 data-[selected=true]:text-white text-default-500 font-bold transition-all duration-300 relative whitespace-nowrap"
                            >
                                <span className="relative z-10 whitespace-nowrap text-sm">{tab.label}</span>
                                <Tabs.Indicator className="bg-accent rounded-xl shadow-accent-glow" />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>

            <main>
                {activeTab === "rate-items" && (
                    <RateItemsList
                        onEdit={rateItemActions.onEdit}
                        onAdd={rateItemActions.onAdd}
                        onArchive={rateItemActions.onArchive}
                    />
                )}
                {activeTab === "rate-cards" && (
                    <RateCardsList onAdd={rateCardActions.onAdd} />
                )}
                {activeTab === "modifier-codes" && (
                    <ModifierCodesList
                        onEdit={modifierCodeActions.onEdit}
                        onAdd={modifierCodeActions.onAdd}
                        onToggleActive={modifierCodeActions.onToggleActive}
                        onArchive={modifierCodeActions.onArchive}
                    />
                )}
            </main>

            {/* Modals */}
            <RateItemModal
                isOpen={rateItemModal.isOpen}
                onOpenChange={rateItemModal.setIsOpen}
                item={rateItemModal.selectedItem}
                onSuccess={rateItemActions.onSuccess}
                isPending={rateItemModal.isPending}
            />

            <RateCardCreateModal
                isOpen={rateCardModal.isOpen}
                onOpenChange={rateCardModal.setIsOpen}
                onSuccess={rateCardActions.onSuccess}
                isPending={rateCardModal.isPending}
            />

            <ModifierCodeModal
                isOpen={modifierCodeModal.isOpen}
                onOpenChange={modifierCodeModal.setIsOpen}
                codeRef={modifierCodeModal.selectedCode}
                onSuccess={modifierCodeActions.onSuccess}
                isPending={modifierCodeModal.isPending}
            />
        </Surface>
    );
}