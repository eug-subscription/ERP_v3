import React from "react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Button,
  Input,
  Divider,
  Badge
} from "@heroui/react";
import { Icon } from "@iconify/react";

export interface Rate {
  id: string;
  name: string;
  unit: string;
  currency: string;
  amount: number;
  isDefault?: boolean;
  lastUsed?: boolean;
}

interface RateDropdownProps {
  label: string;
  placeholder?: string;
  selectedRate?: Rate | null;
  rates: Rate[];
  onRateChange: (rate: Rate) => void;
  onCreateNewClick?: () => void;
  isRequired?: boolean;
}

const RateDropdown: React.FC<RateDropdownProps> = ({
  label,
  placeholder = "Select a rate",
  selectedRate,
  rates,
  onRateChange,
  onCreateNewClick,
  isRequired = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Filter rates based on search query
  const filteredRates = React.useMemo(() => {
    if (!searchQuery) return rates;
    
    const query = searchQuery.toLowerCase();
    return rates.filter(rate => 
      rate.name.toLowerCase().includes(query) || 
      rate.unit.toLowerCase().includes(query) ||
      rate.currency.toLowerCase().includes(query) ||
      rate.amount.toString().includes(query)
    );
  }, [rates, searchQuery]);
  
  // Format currency and amount
  const formatCurrency = (currency: string, amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  };
  
  // Helper to determine text color classes
  const getTextColorClasses = () => {
    return selectedRate ? 'text-foreground' : 'text-default-500';
  };
  
  return (
    <div className="w-full">
      <label className={`block text-sm font-medium mb-1 ${isRequired ? "flex items-center gap-1" : ""}`}>
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      
      <Dropdown 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom"
        classNames={{
          content: "p-0 min-w-[360px]"
        }}
      >
        <DropdownTrigger>
          <Button
            variant="bordered"
            className={`w-full justify-start h-[38px] px-3 ${getTextColorClasses()}`}
          >
            {selectedRate ? (
              <div className="flex items-center justify-between w-full">
                <div className="truncate">
                  <span className="font-medium">{selectedRate.name}</span>
                  <span className="text-default-500 ml-2 text-sm">
                    {selectedRate.unit}
                  </span>
                </div>
                <span className="font-medium ml-2 flex-shrink-0">
                  {formatCurrency(selectedRate.currency, selectedRate.amount)}
                </span>
              </div>
            ) : (
              <span className="text-default-500">{placeholder}</span>
            )}
            <Icon
              icon="lucide:chevron-down"
              className="ml-auto text-default-500 flex-shrink-0"
              width={18}
              height={18}
            />
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu 
          aria-label="Rate selection"
          className="p-0"
          closeOnSelect
          onAction={(key) => {
            if (key === "create-new") {
              onCreateNewClick?.();
              return;
            }
            
            const selectedRate = rates.find(rate => rate.id === key);
            if (selectedRate) {
              onRateChange(selectedRate);
            }
          }}
        >
          <div className="p-3 border-b border-default-200">
            <Input
              ref={searchInputRef}
              placeholder="Search rates..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" width={16} height={16} className="text-default-500" />}
              size="sm"
              classNames={{
                inputWrapper: "bg-default-100"
              }}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-0">
            {filteredRates.length > 0 ? (
              filteredRates.map((rate) => (
                <DropdownItem
                  key={rate.id}
                  className="py-2 px-3"
                  startContent={
                    <div className={`h-4 w-4 rounded-full ${selectedRate?.id === rate.id ? 'bg-primary-500' : 'border-2 border-default-300'} flex-shrink-0`}>
                      {selectedRate?.id === rate.id && (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  }
                  endContent={
                    <div className="flex items-center">
                      <span className="font-medium whitespace-nowrap">
                        {formatCurrency(rate.currency, rate.amount)}
                      </span>
                      {rate.isDefault && (
                        <Badge color="primary" variant="flat" className="ml-2">
                          Default
                        </Badge>
                      )}
                      {rate.lastUsed && (
                        <Badge color="secondary" variant="flat" className="ml-2">
                          Last used
                        </Badge>
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{rate.name}</span>
                    <span className="text-default-500 text-xs">{rate.unit}</span>
                  </div>
                </DropdownItem>
              ))
            ) : (
              <div className="p-4 text-center text-default-500">
                <Icon icon="lucide:search-x" className="mx-auto mb-2" width={24} height={24} />
                <p>No rates found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
          
          <Divider className="my-0" />
          
          <DropdownItem
            key="create-new"
            className="text-primary-500 font-medium"
            startContent={<Icon icon="lucide:plus" width={16} height={16} />}
          >
            Create new rate
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default RateDropdown;