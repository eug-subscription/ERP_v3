import React from "react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection,
  Button,
  Input,
  Divider,
  Badge
} from "@heroui/react";
import { Icon } from "@iconify/react";

export interface Rate {
  id: string;
  name: string;
  unit: string; // Now required but will handle missing values
  currency: string;
  amount: number;
  isDefault?: boolean;
  lastUsed?: boolean;
  subtext?: string; // Added for additional information
  createdDate?: string; // Added for creation date
}

interface RateDropdownProps {
  label: string;
  placeholder?: string;
  selectedRate?: Rate | null;
  rates: Rate[];
  onRateChange: (rate: Rate) => void;
  onCreateNewClick?: () => void;
  isRequired?: boolean;
  className?: string; // Add className prop for external styling
}

const RateDropdown: React.FC<RateDropdownProps> = ({
  label,
  placeholder = "Select a rate",
  selectedRate,
  rates,
  onRateChange,
  onCreateNewClick,
  isRequired = false,
  className = "" // Default to empty string
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // Create a controlled selectedKeys state that syncs with selectedRate
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    selectedRate ? new Set([selectedRate.id]) : new Set()
  );
  
  // Keep selectedKeys in sync with selectedRate from props
  React.useEffect(() => {
    if (selectedRate) {
      setSelectedKeys(new Set([selectedRate.id]));
    } else {
      setSelectedKeys(new Set());
    }
  }, [selectedRate]);
  
  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Sort rates: last used first, then default, then alphabetical
  const sortedRates = React.useMemo(() => {
    return [...rates].sort((a, b) => {
      // Last used rates first
      if (a.lastUsed && !b.lastUsed) return -1;
      if (!a.lastUsed && b.lastUsed) return 1;
      
      // Then default rates
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      // Finally alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }, [rates]);
  
  // Filter rates based on search query - now using sortedRates
  const filteredRates = React.useMemo(() => {
    if (!searchQuery) return sortedRates;
    
    const query = searchQuery.toLowerCase();
    return sortedRates.filter(rate => 
      rate.name.toLowerCase().includes(query) || 
      (rate.unit && rate.unit.toLowerCase().includes(query)) ||
      rate.currency.toLowerCase().includes(query) ||
      rate.amount.toString().includes(query) ||
      (rate.subtext && rate.subtext.toLowerCase().includes(query))
    );
  }, [sortedRates, searchQuery]);
  
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
  
  // Helper to ensure unit is displayed
  const getDisplayUnit = (unit?: string) => {
    return unit && unit.trim() !== "" ? unit : "";
  };
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <Dropdown 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        classNames={{
          content: "p-0 w-full md:w-[420px] overflow-hidden",
          trigger: "min-h-[48px] bg-transparent w-full border border-default-200 rounded-lg"
        }}
      >
        <DropdownTrigger>
          <Button
            variant="bordered"
            className={`w-full justify-between min-h-[48px] px-3 pr-4 ${getTextColorClasses()}`}
          >
            <div className="flex items-center w-full overflow-hidden">
              {selectedRate ? (
                <div className="flex items-center w-full">
                  {/* Left side: Name + Unit - Fix truncation */}
                  <div className="flex items-center mr-auto overflow-hidden min-w-0">
                    <span className="font-medium truncate">{selectedRate.name}</span>
                    {selectedRate.unit && (
                      <span className="text-default-500 ml-2 whitespace-nowrap flex-shrink-0">
                        {getDisplayUnit(selectedRate.unit)}
                      </span>
                    )}
                    
                    {/* REMOVED: Badges between name/unit and price */}
                  </div>
                  
                  {/* Right side: Price (always right-aligned) */}
                  <span className="font-medium ml-2 flex-shrink-0 whitespace-nowrap">
                    {formatCurrency(selectedRate.currency, selectedRate.amount)}
                  </span>
                </div>
              ) : (
                <span className="text-default-500 truncate">{placeholder}</span>
              )}
            </div>
            <Icon
              icon="lucide:chevron-down"
              className="text-default-500 flex-shrink-0 ml-2"
              width={18}
              height={18}
            />
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu 
          aria-label="Rate selection"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedKeys}
          hideSelectedIcon={false}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            if (key === "create-new") {
              onCreateNewClick?.();
              return;
            }
            
            const selectedRate = rates.find(rate => rate.id === key);
            if (selectedRate) {
              // Update both the internal state and call the parent handler
              setSelectedKeys(new Set([key]));
              onRateChange(selectedRate);
            }
          }}
          className="p-0 w-full"
          classNames={{
            base: "p-0 border-b-0 w-full",
          }}
        >
          {/* Search input section - Fixed height for consistency */}
          <DropdownSection className="sticky top-0 bg-background z-10 h-[60px]" showDivider>
            <DropdownItem key="search-input" isReadOnly className="cursor-default p-0 h-full">
              <Input
                ref={searchInputRef}
                placeholder="Search rates..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Icon icon="lucide:search" width={16} height={16} className="text-default-500" />}
                size="sm"
                classNames={{
                  base: "p-3 h-full",
                  inputWrapper: "bg-default-100 px-3 h-full", // Equal padding left and right
                  input: "px-1" // Better text alignment with search icon
                }}
              />
            </DropdownItem>
          </DropdownSection>
          
          {/* Rate items section - Reduced height on mobile for better visibility */}
          <DropdownSection className="overflow-y-auto h-[200px] md:h-[240px]">
            {filteredRates.length > 0 ? (
              filteredRates.map((rate) => (
                <DropdownItem
                  key={rate.id}
                  textValue={rate.name}
                  className="px-3 py-2.5 hover:bg-default-100"
                  startContent={
                    selectedRate?.id === rate.id ? (
                      <Icon icon="lucide:check" className="text-primary-500 mr-2" width={16} />
                    ) : (
                      <span className="w-4 mr-2" /> // Spacer for alignment when no check
                    )
                  }
                >
                  <div className="grid grid-cols-[1fr,auto] w-full gap-2">
                    {/* Left column: Name, unit, creation date */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-x-2">
                        <span className="font-medium">{rate.name}</span>
                        
                        {rate.unit && (
                          <span className="text-default-500 text-sm">
                            {getDisplayUnit(rate.unit)}
                          </span>
                        )}
                        
                        {/* REMOVED: Badges */}
                      </div>
                      
                      {/* Creation date only - REMOVED last used text */}
                      <span className="text-default-400 text-xs mt-0.5">
                        {rate.createdDate || "Created Jan 1, 2023"}
                      </span>
                    </div>
                    
                    {/* Right column: Price only (always right-aligned) - NO CHECKMARK */}
                    <div className="flex items-center">
                      <span className="font-medium whitespace-nowrap text-right">
                        {formatCurrency(rate.currency, rate.amount)}
                      </span>
                      
                      {/* REMOVED: No checkmark on right side */}
                    </div>
                  </div>
                </DropdownItem>
              ))
            ) : (
              <DropdownItem key="no-results" isDisabled className="h-full" textValue="No results found">
                <div className="flex flex-col items-center justify-center p-4">
                  <Icon icon="lucide:search-x" className="mb-2" width={24} height={24} />
                  <p className="text-center text-default-500">No rates found matching "{searchQuery}"</p>
                </div>
              </DropdownItem>
            )}
          </DropdownSection>
          
          {/* Create new section - Fixed vertical centering */}
          <DropdownSection className="border-t border-default-200 border-b-0 p-0">
            <DropdownItem
              key="create-new"
              textValue="Create new rate"
              className="text-primary-500 font-medium px-3 py-3 min-h-[48px] border-b-0" // Increased height for touch
              startContent={<Icon icon="lucide:plus" width={16} height={16} />}
            >
              Create new rate
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default RateDropdown;