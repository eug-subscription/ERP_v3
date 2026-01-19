import React from "react";
import { Card, CardBody, Select, SelectItem, Input, Button, Divider, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import RateDropdown, { Rate } from "./rate-dropdown";
import { addToast } from "@heroui/react";

// ---- Static Data (Outside Component) ----
const retouchingRates: Rate[] = [
  {
    id: "1",
    name: "Standard AI Retouching",
    currency: "USD",
    amount: 15.00,
    unit: "per image",
    isDefault: true,
    lastUsed: false
  },
  {
    id: "2",
    name: "Advanced AI Retouching",
    currency: "USD",
    amount: 25.00,
    unit: "per image",
    isDefault: false,
    lastUsed: true
  },
  {
    id: "3",
    name: "Premium Human Retouching",
    currency: "USD",
    amount: 45.00,
    unit: "per image",
    isDefault: false,
    lastUsed: false
  }
];

const currencyOptions = [
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
  { label: "JPY (¥)", value: "JPY" },
  { label: "AED (د.إ)", value: "AED" },
];

const unitOptions = [
  { label: "per image", value: "per image" },
  { label: "per hour", value: "per hour" },
  { label: "per project", value: "per project" },
];

const typeOptions = [
  { label: "AI Retouching", value: "ai" },
  { label: "Human Retouching", value: "human" },
];

// ---- Types ----
type RetouchingLevel = "standard" | "advanced" | "premium";
type RetouchingType = "ai" | "human";

interface RetouchingRateRow {
  id: string;
  level: RetouchingLevel;
  type: RetouchingType;
  clientRate: {
    name: string;
    currency: string;
    amount: string;
    unit: string;
  };
  retoucherRate?: {
    name: string;
    currency: string;
    amount: string;
    unit: string;
  };
}

const RetouchingConfigCard: React.FC = () => {
  // UI state
  const [rateType, setRateType] = React.useState<"existing" | "new">("existing");
  const [selectedRetouchingRate, setSelectedRetouchingRate] = React.useState<Rate | null>(null);

  // Retouching row(s) state
  const [retouchingRows, setRetouchingRows] = React.useState<RetouchingRateRow[]>([
    {
      id: crypto.randomUUID(),
      level: "standard",
      type: "ai",
      clientRate: {
        name: "", // Changed from "Standard AI Retouching" to empty string
        currency: "USD",
        amount: "15.00",
        unit: "per image"
      }
    }
  ]);

  // Created rates for "new" mode
  const [createdRates, setCreatedRates] = React.useState<RetouchingRateRow[]>([]);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editingRateId, setEditingRateId] = React.useState<string | null>(null);

  // Field-specific error states
  const [errors, setErrors] = React.useState<{
    clientRateName?: string;
    clientRateCurrency?: string;
    clientRateAmount?: string;
    clientRateUnit?: string;
    retoucherRateName?: string;
    retoucherRateCurrency?: string;
    retoucherRateAmount?: string;
    retoucherRateUnit?: string;
  }>({});

  // Inline error states
  const [clientRateError, setClientRateError] = React.useState<string>("");

  // Filter available rates to prevent duplicate selections
  const getAvailableRates = (currentIndex: number) => {
    // Get ALL currently selected rates from every dropdown
    const selectedRateIds = selectedRates
      .filter((rate, index) => rate !== null && index !== currentIndex)
      .map(rate => rate!.id);
    
    // Combine predefined and created rates
    const allRates = [
      ...retouchingRates, 
      ...createdRates.map(row => ({
        id: row.id,
        name: row.clientRate.name,
        currency: row.clientRate.currency,
        amount: parseFloat(row.clientRate.amount),
        unit: row.clientRate.unit,
        isDefault: false,
        // Set lastUsed flag based on if this is the currently selected rate
        lastUsed: selectedRates[currentIndex]?.id === row.id
      }))
    ];
    
    // Return rates that aren't selected elsewhere
    return allRates
      .filter(rate => !selectedRateIds.includes(rate.id))
      .map(rate => ({
        ...rate,
        // Set lastUsed flag only for the rate selected at this index
        lastUsed: selectedRates[currentIndex]?.id === rate.id
      }));
  };

  // Format numeric input on blur
  const handleAmountBlur = (value: string, setter: (val: string) => void) => {
    const cleaned = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
    setter(cleaned.toFixed(2));
  };

  // Validate a single field
  const validateField = (field: string, value: string | undefined): string | undefined => {
    if (!value || value.trim() === '') {
      switch (field) {
        case 'clientRateName':
          return 'Please enter a rate name';
        case 'clientRateCurrency':
          return 'Please select a currency';
        case 'clientRateAmount':
          return 'Please enter an amount';
        case 'clientRateUnit':
          return 'Please select a unit';
        case 'retoucherRateName':
          return 'Please enter a retoucher rate name';
        case 'retoucherRateCurrency':
          return 'Please select a currency';
        case 'retoucherRateAmount':
          return 'Please enter an amount';
        case 'retoucherRateUnit':
          return 'Please select a unit';
        default:
          return 'This field is required';
      }
    }
    
    // Validate amount is a valid number
    if (field.includes('Amount')) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return 'Amount must be a valid number';
      }
    }
    
    return undefined;
  };

  // Add the getRateDetails function inside the component
  const getRateDetails = (rateId: string | undefined) => {
    if (!rateId) return null;
    
    // Check created rates first
    const createdRate = createdRates.find(rate => rate.id === rateId);
    if (createdRate) {
      return {
        type: createdRate.type,
        level: createdRate.level,
        retoucherRate: createdRate.retoucherRate
      };
    }
    
    // If not found in created rates, check predefined rates
    const predefinedRate = retouchingRates.find(rate => rate.id === rateId);
    if (predefinedRate) {
      // For predefined rates, infer type and level from name
      const name = predefinedRate.name.toLowerCase();
      let type: RetouchingType = "ai";
      let level: RetouchingLevel = "standard";
      
      if (name.includes("human")) {
        type = "human";
      }
      
      if (name.includes("advanced")) {
        level = "advanced";
      } else if (name.includes("premium")) {
        level = "premium";
      }
      
      return {
        type,
        level,
        retoucherRate: type === "human" ? {
          name: `${level.charAt(0).toUpperCase() + level.slice(1)} Retoucher Rate`,
          currency: predefinedRate.currency,
          amount: predefinedRate.amount.toString(),
          unit: predefinedRate.unit
        } : undefined
      };
    }
    
    // If not found anywhere, return default values
    return {
      type: "ai" as RetouchingType,
      level: "standard" as RetouchingLevel,
      retoucherRate: undefined
    };
  };

  // Handle client rate change with validation
  const handleClientRateChange = (rowId: string, field: string, value: string) => {
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [`clientRate${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined
    }));
    
    setRetouchingRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          clientRate: {
            ...row.clientRate,
            [field]: value
          }
        };
      }
      return row;
    }));
  };

  // Handle retoucher rate change with validation
  const handleRetoucherRateChange = (rowId: string, field: string, value: string) => {
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [`retoucherRate${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined
    }));
    
    setRetouchingRows(prev => prev.map(row => {
      if (row.id === rowId && row.retoucherRate) {
        return {
          ...row,
          retoucherRate: {
            ...row.retoucherRate,
            [field]: value
          }
        };
      }
      return row;
    }));
  };

  // Toggle between AI/Human retouching
  const handleTypeChange = (rowId: string, type: RetouchingType) => {
    setRetouchingRows(prev => prev.map(row => {
      if (row.id === rowId) {
        // Create retoucher rate for human type if needed, but don't modify client rate name
        const retoucherRate = type === "human"
          ? row.retoucherRate || {
              name: `${row.level.charAt(0).toUpperCase() + row.level.slice(1)} Retoucher Rate`,
              currency: "USD",
              amount: "0.00",
              unit: "per image"
            }
          : undefined;
        return {
          ...row,
          type,
          retoucherRate
        };
      }
      return row;
    }));
  };

  // Add a new custom retouching row (for multi-row support)
  const addRetouchingRow = () => {
    setRetouchingRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        level: "standard",
        type: "ai",
        clientRate: {
          name: "Standard AI Retouching",
          currency: "USD",
          amount: "15.00",
          unit: "per image"
        }
      }
    ]);
  };

  // Remove a row (disallow removing last)
  const removeRetouchingRow = (rowId: string) => {
    if (retouchingRows.length <= 1) return;
    setRetouchingRows(prev => prev.filter(row => row.id !== rowId));
  };

  // Create or edit a rate with field validation
  const handleCreateRate = () => {
    const currentRow = retouchingRows[0];
    const newErrors: Record<string, string | undefined> = {};
    let hasErrors = false;
    
    // Validate client rate fields
    newErrors.clientRateName = validateField('clientRateName', currentRow.clientRate.name);
    newErrors.clientRateCurrency = validateField('clientRateCurrency', currentRow.clientRate.currency);
    newErrors.clientRateAmount = validateField('clientRateAmount', currentRow.clientRate.amount);
    newErrors.clientRateUnit = validateField('clientRateUnit', currentRow.clientRate.unit);
    
    // Validate retoucher rate fields if type is human
    if (currentRow.type === 'human' && currentRow.retoucherRate) {
      newErrors.retoucherRateName = validateField('retoucherRateName', currentRow.retoucherRate.name);
      newErrors.retoucherRateCurrency = validateField('retoucherRateCurrency', currentRow.retoucherRate.currency);
      newErrors.retoucherRateAmount = validateField('retoucherRateAmount', currentRow.retoucherRate.amount);
      newErrors.retoucherRateUnit = validateField('retoucherRateUnit', currentRow.retoucherRate.unit);
    }
    
    // Check if any errors exist
    hasErrors = Object.values(newErrors).some(error => error !== undefined);
    
    // Update error state
    setErrors(newErrors);
    
    // Clear generic error if we have specific errors
    if (hasErrors) {
      setClientRateError("");
      return;
    }
    
    // Proceed with rate creation if no errors
    try {
      // Create a new Rate object from the current row
      const newRateId = editingRateId || crypto.randomUUID();
      const newRate: Rate = {
        id: newRateId,
        name: currentRow.clientRate.name,
        currency: currentRow.clientRate.currency,
        amount: parseFloat(currentRow.clientRate.amount),
        unit: currentRow.clientRate.unit,
        isDefault: false,
        lastUsed: true
      };
      
      // Create the retouching row with the same ID
      const newRetouchingRow = {
        ...currentRow,
        id: newRateId
      };
      
      if (editingRateId) {
        // Update existing rate
        setCreatedRates(prev => prev.map(rate =>
          rate.id === editingRateId ? newRetouchingRow : rate
        ));
        
        // If this rate was selected anywhere, update it
        const updatedSelectedRates = [...selectedRates];
        let rateWasSelected = false;
        
        for (let i = 0; i < updatedSelectedRates.length; i++) {
          if (updatedSelectedRates[i]?.id === editingRateId) {
            rateWasSelected = true;
            // We'll update these references after state updates
          }
        }
        
        // Update states first
        setSelectedRates(updatedSelectedRates);
        
        // Then update references to ensure they match the dropdown options
        if (rateWasSelected) {
          // Use setTimeout to ensure this runs after state updates
          setTimeout(() => {
            const updatedRates = [...selectedRates];
            
            for (let i = 0; i < updatedRates.length; i++) {
              if (updatedRates[i]?.id === editingRateId) {
                // Find the rate in the available rates for this dropdown
                const availableRates = getAvailableRates(i);
                const matchingRate = availableRates.find(r => r.id === editingRateId);
                
                if (matchingRate) {
                  updatedRates[i] = matchingRate;
                }
              }
            }
            
            setSelectedRates(updatedRates);
            
            // Update main selected rate if it was the one edited
            if (selectedRetouchingRate?.id === editingRateId) {
              const availableMainRates = getAvailableRates(0);
              const matchingMainRate = availableMainRates.find(r => r.id === editingRateId);
              if (matchingMainRate) {
                setSelectedRetouchingRate(matchingMainRate);
              }
            }
          }, 0);
        }
        
        setEditingRateId(null);
      } else {
        // Add new rate to created rates
        setCreatedRates(prev => [...prev, newRetouchingRow]);
        
        // Switch back to "existing" mode with the new rate selected
        setRateType("existing");
        
        // Use setTimeout to ensure this runs after state updates
        setTimeout(() => {
          // Get the available rates for the main dropdown
          const availableRates = getAvailableRates(0);
          
          // Find the newly created rate in the available rates
          const matchingRate = availableRates.find(r => r.id === newRateId);
          
          if (matchingRate) {
            // Select the new rate in the main dropdown only
            // and ensure it's removed from any other dropdown where it might be selected
            const updatedSelectedRates = [...selectedRates];
            updatedSelectedRates[0] = matchingRate;
            
            // Clear any duplicate selections of this new rate in other dropdowns
            for (let i = 1; i < updatedSelectedRates.length; i++) {
              if (updatedSelectedRates[i]?.id === newRateId) {
                updatedSelectedRates[i] = null;
              }
            }
            
            // Update both state variables synchronously to ensure consistency
            setSelectedRetouchingRate(matchingRate);
            setSelectedRates(updatedSelectedRates);
          }
        }, 0);
      }
      
      // Reset the form for next use
      setRetouchingRows([{
        id: crypto.randomUUID(),
        level: "standard",
        type: "ai",
        clientRate: {
          name: "",
          currency: "USD",
          amount: "15.00",
          unit: "per image"
        }
      }]);
      
      // Show success toast
      addToast({
        title: "Rate created and applied!",
        description: "Your new rate is now active for this project.",
        color: "success",
        timeout: 3000,
        icon: <Icon icon="lucide:check-circle" width={24} height={24} />,
      });
      
      setIsEditing(false);
    } catch (error) {
      // Show error toast if something goes wrong
      addToast({
        title: "Could not save",
        description: "Please try again.",
        color: "danger",
        timeout: 3000,
        icon: <Icon icon="lucide:alert-circle" width={24} height={24} />,
      });
    }
  };

  // Edit a created rate
  const handleEditRate = (rateId: string) => {
    const rateToEdit = createdRates.find(rate => rate.id === rateId);
    if (rateToEdit) {
      setRetouchingRows([rateToEdit]);
      setEditingRateId(rateId);
      setIsEditing(true);
    }
  };

  // Delete a created rate
  const handleDeleteRate = (rateId: string) => {
    setCreatedRates(prev => prev.filter(rate => rate.id !== rateId));
  };

  // Save all rates (simulate API call)
  const handleSaveAllRates = () => {
    alert(`Successfully saved ${createdRates.length} retouching rates`);
    // Here: trigger API call, loading states, etc.
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingRateId(null);
    setClientRateError("");
    setRetouchingRows([{
      id: crypto.randomUUID(),
      level: "standard",
      type: "ai",
      clientRate: {
        name: "Standard AI Retouching",
        currency: "USD",
        amount: "15.00",
        unit: "per image"
      }
    }]);
  };

  // Add state for additional rates
  const [selectedRates, setSelectedRates] = React.useState<(Rate | null)[]>([null]);
  
  // Handle selection of the main retouching rate
  const handleRateSelection = (rate: Rate) => {
    // Update both state variables synchronously
    const newSelectedRates = [...selectedRates];
    newSelectedRates[0] = rate;
    
    setSelectedRetouchingRate(rate);
    setSelectedRates(newSelectedRates);
  };
  
  // Handle selection of additional rates
  const handleAdditionalRateSelection = (index: number, rate: Rate) => {
    setSelectedRates(prev => {
      const newRates = [...prev];
      
      // If this rate is already selected somewhere else, clear that selection
      for (let i = 0; i < newRates.length; i++) {
        if (i !== index && newRates[i]?.id === rate.id) {
          newRates[i] = null;
        }
      }
      
      // If this is the main dropdown and the rate was previously selected there,
      // update the main selectedRetouchingRate as well
      if (index === 0 && selectedRetouchingRate?.id !== rate.id) {
        setSelectedRetouchingRate(rate);
      }
      
      // Set the new rate at the specified index
      newRates[index] = rate;
      return newRates;
    });
  };
  
  // Add another rate row
  const addAnotherRate = () => {
    setSelectedRates(prev => [...prev, null]);
  };
  
  // Remove a rate row
  const removeRate = (index: number) => {
    setSelectedRates(prev => {
      const newRates = [...prev];
      newRates.splice(index, 1);
      return newRates;
    });
  };

  // Handle level change
  const handleLevelChange = (rowId: string, level: RetouchingLevel) => {
    setRetouchingRows(prev => prev.map(row => {
      if (row.id === rowId) {
        // Only update the level, don't modify the client rate name
        return {
          ...row,
          level
        };
      }
      return row;
    }));
  };

  return (
    <Card shadow="none" className="p-0 border border-gray-200">
      <CardBody className="p-6">
        <div className="flex items-center mb-1">
          <Icon icon="lucide:wand-2" className="text-primary-500 mr-2" />
          <h3 className="text-lg font-semibold">Retouching</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 md:mb-6">Professional image retouching and enhancement</p>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Retouching Rates</h4>
            <span className="text-red-500 font-semibold">*</span>
          </div>
          {/* Removed "Add one or more retouching rates for this project" text */}

          {/* Radio buttons - Update height and padding to match other service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="w-full">
              <Button
                type="button"
                role="radio"
                aria-checked={rateType === "existing"}
                tabIndex={0}
                className={`bg-white justify-start text-left p-4 h-[56px] border w-full ${
                  rateType === "existing" ? "border-primary-500" : "border-gray-200"
                }`}
                variant="flat"
                radius="lg"
                disableRipple
                onPress={() => setRateType("existing")}
              >
                <div className="flex items-center w-full">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                    {rateType === "existing" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">Use existing rate</div>
                    <div className="text-xs text-gray-500">Select from your saved retouching rates</div>
                  </div>
                </div>
              </Button>
            </div>
            <div className="w-full">
              <Button
                type="button"
                role="radio"
                aria-checked={rateType === "new"}
                tabIndex={0}
                className={`bg-white justify-start text-left p-4 h-[56px] border w-full ${
                  rateType === "new" ? "border-primary-500" : "border-gray-200"
                }`}
                variant="flat"
                radius="lg"
                disableRipple
                onPress={() => setRateType("new")}
              >
                <div className="flex items-center w-full">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                    {rateType === "new" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">Create new rate</div>
                    <div className="text-xs text-gray-500">Define custom retouching rates</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Existing Rate Selection - UPDATED for multiple rates */}
          {rateType === "existing" && (
            <div className="space-y-4">
              {/* First rate selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Retouching Rate Name<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center w-full">
                    <RateDropdown
                      label=""
                      placeholder="Select a rate"
                      selectedRate={selectedRetouchingRate}
                      rates={getAvailableRates(0)}
                      onRateChange={handleRateSelection}
                      onCreateNewClick={() => setRateType("new")}
                      isRequired
                      className="flex-1 min-w-0"
                    />
                    
                    {/* Invisible spacer with exact same width as delete button */}
                    <div className="ml-2 w-10 flex-shrink-0"></div>
                  </div>
                  
                  {/* Rate details summary line */}
                  {selectedRetouchingRate && (
                    <div className="mt-1 text-xs text-gray-500">
                      {(() => {
                        const details = getRateDetails(selectedRetouchingRate.id);
                        if (!details) return null;
                        
                        return (
                          <div className="flex items-center">
                            {details.type === "ai" ? (
                              <Icon icon="lucide:sparkles" className="mr-1 text-gray-400" width={14} />
                            ) : (
                              <Icon icon="lucide:user" className="mr-1 text-gray-400" width={14} />
                            )}
                            <span>
                              {details.type === "ai" ? "AI" : "Human"} Retouching • 
                              {" " + details.level.charAt(0).toUpperCase() + details.level.slice(1)}
                              {details.type === "human" && details.retoucherRate && (
                                <span className="ml-1">
                                  and Retoucher: {details.retoucherRate.currency} {details.retoucherRate.amount} {details.retoucherRate.unit}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div>{/* Empty column for alignment */}</div>
              </div>
              
              {/* Additional rate selections */}
              {selectedRates.slice(1).map((rate, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Additional Retouching Rate
                    </label>
                    <div className="flex items-center w-full">
                      <RateDropdown
                        label=""
                        placeholder="Select a rate"
                        selectedRate={rate}
                        rates={getAvailableRates(index + 1)}
                        onRateChange={(selectedRate) => handleAdditionalRateSelection(index + 1, selectedRate)}
                        onCreateNewClick={() => setRateType("new")}
                        className="flex-1 min-w-0"
                      />
                      
                      {/* Delete button with fixed width */}
                      <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={() => removeRate(index + 1)}
                        className="ml-2 min-h-[48px] w-10 flex-shrink-0"
                      >
                        <Icon icon="lucide:trash-2" width={18} />
                      </Button>
                    </div>
                    
                    {/* Rate details summary line for additional rates */}
                    {rate && (
                      <div className="mt-1 text-xs text-gray-500">
                        {(() => {
                          const details = getRateDetails(rate.id);
                          if (!details) return null;
                          
                          return (
                            <div className="flex items-center">
                              {details.type === "ai" ? (
                                <Icon icon="lucide:sparkles" className="mr-1 text-gray-400" width={14} />
                              ) : (
                                <Icon icon="lucide:user" className="mr-1 text-gray-400" width={14} />
                              )}
                              <span>
                                {details.type === "ai" ? "AI" : "Human"} Retouching • 
                                {" " + details.level.charAt(0).toUpperCase() + details.level.slice(1)}
                                {details.type === "human" && details.retoucherRate && (
                                  <span className="ml-1">
                                    and Retoucher: {details.retoucherRate.currency} {details.retoucherRate.amount} {details.retoucherRate.unit}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div>{/* Empty column for alignment */}</div>
                </div>
              ))}
              
              {/* Add Another Rate button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full">
                  <Button
                    variant="bordered"
                    color="primary"
                    startContent={<Icon icon="lucide:plus" width={16} />}
                    onPress={addAnotherRate}
                    className="text-sm min-h-[40px] w-full border border-primary-200 bg-transparent hover:bg-primary-50 hover:border-primary-300"
                  >
                    Add another retouching rate
                  </Button>
                </div>
                <div>{/* Empty column for alignment */}</div>
              </div>
            </div>
          )}

          {/* Create New Rate UI */}
          {rateType === "new" && (
            <div className="space-y-6">
              {createdRates.length > 0 && !isEditing && (
                <div className="space-y-4">
                  <h5 className="font-medium text-sm text-gray-700">Created Retouching Rates</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="w-full">
                      {createdRates.map((rate) => (
                        <div key={rate.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50 mb-2">
                          <div>
                            <div className="font-medium">{rate.clientRate.name}</div>
                            <div className="text-xs text-gray-500">
                              {rate.level.charAt(0).toUpperCase() + rate.level.slice(1)} •
                              {rate.type === "ai" ? " AI" : " Human"} •
                              {` ${rate.clientRate.currency} ${rate.clientRate.amount} ${rate.clientRate.unit}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditRate(rate.id)}
                              className="text-gray-500"
                            >
                              <Icon icon="lucide:edit" width={16} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleDeleteRate(rate.id)}
                              className="text-gray-500"
                            >
                              <Icon icon="lucide:trash" width={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="w-full">
                      <Button
                        variant="bordered"
                        color="primary"
                        startContent={<Icon icon="lucide:plus" width={16} />}
                        onPress={setIsEditing.bind(null, true)}
                        className="text-sm min-h-[40px] w-full border border-primary-200 bg-transparent hover:bg-primary-50 hover:border-primary-300"
                      >
                        Add Another Retouching Rate
                      </Button>
                    </div>
                    <div></div>
                  </div>
                </div>
              )}
              {(isEditing || createdRates.length === 0) && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  {/* New Rate Name section */}
                  <h6 className="text-sm font-medium text-gray-700 mb-3">
                    New Rate Name<span className="text-red-500 ml-0.5">*</span>
                  </h6>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Rate Name input with inline validation */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Rate Name<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <Input
                        placeholder="e.g. Standard Rate"
                        value={retouchingRows[0].clientRate.name}
                        onValueChange={(value) => handleClientRateChange(retouchingRows[0].id, "name", value)}
                        className="w-full"
                        radius="lg"
                        variant="bordered"
                        classNames={{
                          inputWrapper: `min-h-[40px] bg-transparent ${errors.clientRateName ? 'border-red-500 border-2' : ''}`,
                        }}
                        aria-describedby={errors.clientRateName ? "clientRateName-error" : undefined}
                        isInvalid={!!errors.clientRateName}
                        errorMessage={errors.clientRateName}
                      />
                    </div>
                    
                    <div className="w-full">
                      {/* Empty column for alignment */}
                    </div>
                  </div>
                  
                  {/* Type and Level selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type selector */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type
                      </label>
                      <div className="flex w-full gap-2">
                        {typeOptions.map(option => (
                          <Button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={retouchingRows[0].type === option.value}
                            tabIndex={0}
                            className={`flex-1 px-4 py-2 border ${
                              retouchingRows[0].type === option.value 
                                ? "border-primary-500 bg-primary-50 text-primary-600" 
                                : "border-gray-200 bg-white text-gray-700"
                            } text-sm`}
                            variant="flat"
                            radius="md"
                            disableRipple
                            onPress={() => handleTypeChange(retouchingRows[0].id, option.value as RetouchingType)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Level selector */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Level
                      </label>
                      <div className="flex w-full">
                        <Button
                          type="button"
                          role="radio"
                          aria-checked={retouchingRows[0].level === "standard"}
                          tabIndex={0}
                          className={`flex-1 px-4 py-2 border ${
                            retouchingRows[0].level === "standard" 
                              ? "border-primary-500 bg-primary-50 text-primary-600" 
                              : "border-gray-200 bg-white text-gray-700"
                          } text-sm rounded-l-md rounded-r-none`}
                          variant="flat"
                          radius="none"
                          disableRipple
                          onPress={() => handleLevelChange(retouchingRows[0].id, "standard")}
                        >
                          Standard
                        </Button>
                        <Button
                          type="button"
                          role="radio"
                          aria-checked={retouchingRows[0].level === "advanced"}
                          tabIndex={0}
                          className={`flex-1 px-4 py-2 border-y ${
                            retouchingRows[0].level === "advanced" 
                              ? "border-x border-primary-500 bg-primary-50 text-primary-600" 
                              : "border-x border-gray-200 bg-white text-gray-700"
                          } text-sm rounded-none`}
                          variant="flat"
                          radius="none"
                          disableRipple
                          onPress={() => handleLevelChange(retouchingRows[0].id, "advanced")}
                        >
                          Advanced
                        </Button>
                        <Button
                          type="button"
                          role="radio"
                          aria-checked={retouchingRows[0].level === "premium"}
                          tabIndex={0}
                          className={`flex-1 px-4 py-2 border ${
                            retouchingRows[0].level === "premium" 
                              ? "border-primary-500 bg-primary-50 text-primary-600" 
                              : "border-gray-200 bg-white text-gray-700"
                          } text-sm rounded-l-none rounded-r-md`}
                          variant="flat"
                          radius="none"
                          disableRipple
                          onPress={() => handleLevelChange(retouchingRows[0].id, "premium")}
                        >
                          Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client Rate section with inline validation */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Client Rate<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Currency<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <Select
                          selectedKeys={[retouchingRows[0].clientRate.currency]}
                          onSelectionChange={keys => handleClientRateChange(retouchingRows[0].id, "currency", Array.from(keys)[0] as string)}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ 
                            trigger: `min-h-[40px] bg-transparent ${errors.clientRateCurrency ? 'border-red-500 border-2' : ''}`,
                          }}
                          aria-describedby={errors.clientRateCurrency ? "clientRateCurrency-error" : undefined}
                          isInvalid={!!errors.clientRateCurrency}
                          errorMessage={errors.clientRateCurrency}
                        >
                          {currencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Amount<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={retouchingRows[0].clientRate.amount}
                          onValueChange={value => handleClientRateChange(retouchingRows[0].id, "amount", value)}
                          onBlur={e => handleAmountBlur(e.target.value, v => handleClientRateChange(retouchingRows[0].id, "amount", v))}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ 
                            inputWrapper: `min-h-[40px] bg-transparent ${errors.clientRateAmount ? 'border-red-500 border-2' : ''}`,
                          }}
                          aria-describedby={errors.clientRateAmount ? "clientRateAmount-error" : undefined}
                          isInvalid={!!errors.clientRateAmount}
                          errorMessage={errors.clientRateAmount}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Unit<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <Select
                          selectedKeys={[retouchingRows[0].clientRate.unit]}
                          onSelectionChange={keys => handleClientRateChange(retouchingRows[0].id, "unit", Array.from(keys)[0] as string)}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ 
                            trigger: `min-h-[40px] bg-transparent ${errors.clientRateUnit ? 'border-red-500 border-2' : ''}`,
                          }}
                          aria-describedby={errors.clientRateUnit ? "clientRateUnit-error" : undefined}
                          isInvalid={!!errors.clientRateUnit}
                          errorMessage={errors.clientRateUnit}
                        >
                          {unitOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Retoucher Rate section with inline validation */}
                  {retouchingRows[0].type === "human" && (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Retoucher Rate<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Currency<span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <Select
                            selectedKeys={[retouchingRows[0].retoucherRate?.currency || "USD"]}
                            onSelectionChange={keys => handleRetoucherRateChange(retouchingRows[0].id, "currency", Array.from(keys)[0] as string)}
                            className="w-full"
                            radius="lg"
                            variant="bordered"
                            classNames={{ 
                              trigger: `min-h-[40px] bg-transparent ${errors.retoucherRateCurrency ? 'border-red-500 border-2' : ''}`,
                            }}
                            aria-describedby={errors.retoucherRateCurrency ? "retoucherRateCurrency-error" : undefined}
                            isInvalid={!!errors.retoucherRateCurrency}
                            errorMessage={errors.retoucherRateCurrency}
                          >
                            {currencyOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Amount<span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={retouchingRows[0].retoucherRate?.amount || "0.00"}
                            onValueChange={value => handleRetoucherRateChange(retouchingRows[0].id, "amount", value)}
                            onBlur={e => handleAmountBlur(e.target.value, v => handleRetoucherRateChange(retouchingRows[0].id, "amount", v))}
                            className="w-full"
                            radius="lg"
                            variant="bordered"
                            classNames={{ 
                              inputWrapper: `min-h-[40px] bg-transparent ${errors.retoucherRateAmount ? 'border-red-500 border-2' : ''}`,
                            }}
                            aria-describedby={errors.retoucherRateAmount ? "retoucherRateAmount-error" : undefined}
                            isInvalid={!!errors.retoucherRateAmount}
                            errorMessage={errors.retoucherRateAmount}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Unit<span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <Select
                            selectedKeys={[retouchingRows[0].retoucherRate?.unit || "per image"]}
                            onSelectionChange={keys => handleRetoucherRateChange(retouchingRows[0].id, "unit", Array.from(keys)[0] as string)}
                            className="w-full"
                            radius="lg"
                            variant="bordered"
                            classNames={{ 
                              trigger: `min-h-[40px] bg-transparent ${errors.retoucherRateUnit ? 'border-red-500 border-2' : ''}`,
                            }}
                            aria-describedby={errors.retoucherRateUnit ? "retoucherRateUnit-error" : undefined}
                            isInvalid={!!errors.retoucherRateUnit}
                            errorMessage={errors.retoucherRateUnit}
                          >
                            {unitOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Remove generic error message when specific errors are present */}
                  {clientRateError && !Object.values(errors).some(error => error !== undefined) && (
                    <div className="text-red-500 text-xs mt-2" role="alert">{clientRateError}</div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="w-full flex flex-col md:flex-row md:justify-end mt-6">
                    {isEditing && (
                      <Button 
                        color="default"
                        variant="bordered"
                        size="md"
                        className="min-h-[40px] mb-2 md:mb-0 md:mr-2"
                        onPress={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      color="primary" 
                      size="md"
                      className="min-h-[40px] w-full md:w-auto"
                      onPress={handleCreateRate}
                    >
                      {editingRateId ? "Save Changes" : "Create & Use Rate"}
                    </Button>
                  </div>
                </div>
              )}
              {createdRates.length > 0 && !isEditing && (
                <div className="w-full flex flex-col md:flex-row md:justify-end mt-6">
                  <Button 
                    color="primary" 
                    size="md"
                    className="min-h-[40px] w-full md:w-auto"
                    onPress={handleSaveAllRates}
                  >
                    Save All Rates
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default RetouchingConfigCard;