import { Select, ListBox, NumberField, Label } from "@heroui/react";
import { RateItem } from "../../../types/pricing";

interface RateItemFormProps {
    selectedTypeId: string;
    setSelectedTypeId: (id: string) => void;
    quantity: number;
    setQuantity: (qty: number) => void;
    availableRateItems: RateItem[];
}

export function RateItemForm({
    selectedTypeId,
    setSelectedTypeId,
    quantity,
    setQuantity,
    availableRateItems,
}: RateItemFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
                placeholder="Select type..."
                selectedKey={selectedTypeId}
                onSelectionChange={(key) => setSelectedTypeId(key ? key.toString() : "")}
                className="w-full overflow-visible"
                isRequired
            >
                <Label className="py-2 inline-block leading-loose">Rate Item</Label>
                <Select.Trigger autoFocus>
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox items={availableRateItems}>
                        {(item) => (
                            <ListBox.Item key={item.id} id={item.id} textValue={item.displayName || item.name}>
                                {item.displayName || item.name}
                            </ListBox.Item>
                        )}
                    </ListBox>
                </Select.Popover>
            </Select>

            <NumberField
                minValue={0}
                value={quantity}
                onChange={setQuantity}
                className="overflow-visible"
                isRequired
            >
                <Label className="py-2 inline-block leading-loose">Quantity</Label>
                <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input />
                    <NumberField.IncrementButton />
                </NumberField.Group>
            </NumberField>
        </div>
    );
}
