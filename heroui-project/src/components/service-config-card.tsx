import React from "react";
import { Card, CardBody, Select, SelectItem, Input, Button } from "@heroui/react";
import RateDropdown, { Rate } from "./rate-dropdown";

// ---- Static Data Outside Component ----
const clientRates: Rate[] = [
  { id: "standard", name: "Standard Rate", unit: "per hour", currency: "USD", amount: 120, isDefault: true, createdDate: "Created Jan 10, 2023" },
  { id: "premium", name: "Premium Rate", unit: "per day", currency: "USD", amount: 850, lastUsed: true, createdDate: "Created Mar 15, 2023" },
  { id: "economy", name: "Economy Rate", unit: "per project", currency: "USD", amount: 500, createdDate: "Created Apr 22, 2023" },
  { id: "custom", name: "Custom Rate", unit: "per hour", currency: "EUR", amount: 100, createdDate: "Created May 5, 2023" },
];

const photographerRates: Rate[] = [
  { id: "standard-photo", name: "Standard Photographer", unit: "per hour", currency: "USD", amount: 85, isDefault: true, createdDate: "Created Feb 3, 2023" },
  { id: "premium-photo", name: "Premium Photographer", unit: "per day", currency: "USD", amount: 650, createdDate: "Created Mar 12, 2023" },
  { id: "beginner-photo", name: "Beginner Photographer", unit: "per project", currency: "USD", amount: 350, lastUsed: true, createdDate: "Created Apr 8, 2023" },
];

const videographerRates: Rate[] = [
  { id: "standard-video", name: "Standard Videographer", unit: "per hour", currency: "USD", amount: 95, isDefault: true, createdDate: "Created Jan 25, 2023" },
  { id: "premium-video", name: "Premium Videographer", unit: "per day", currency: "USD", amount: 750, createdDate: "Created Feb 18, 2023" },
  { id: "beginner-video", name: "Beginner Videographer", unit: "per project", currency: "USD", amount: 400, createdDate: "Created Mar 30, 2023" },
];

const currencyOptions = [
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
  { label: "JPY (¥)", value: "JPY" },
  { label: "AED (د.إ)", value: "AED" },
];

const unitOptions = [
  { label: "per hour", value: "per hour" },
  { label: "per day", value: "per day" },
  { label: "per project", value: "per project" },
];

// ---- Component Props ----
interface ServiceConfigCardProps {
  title: string;
  description: string;
  serviceType: "photography" | "videography" | "client-only";
}

// ---- Main Component ----
const ServiceConfigCard: React.FC<ServiceConfigCardProps> = ({ title, description, serviceType }) => {
  // Client state
  const [clientRateType, setClientRateType] = React.useState<"existing" | "new">("existing");
  const [clientRateName, setClientRateName] = React.useState("");
  const [clientRateAmount, setClientRateAmount] = React.useState("0.00");
  const [clientRateCurrency, setClientRateCurrency] = React.useState("USD");
  const [clientRateUnit, setClientRateUnit] = React.useState("per hour");
  const [selectedClientRate, setSelectedClientRate] = React.useState<Rate | null>(clientRates[0]);

  // Provider state
  const [providerRateType, setProviderRateType] = React.useState<"existing" | "new">("existing");
  const [providerRateName, setProviderRateName] = React.useState("");
  const [providerRateAmount, setProviderRateAmount] = React.useState("0.00");
  const [providerRateCurrency, setProviderRateCurrency] = React.useState("USD");
  const [providerRateUnit, setProviderRateUnit] = React.useState("per hour");
  const [selectedProviderRate, setSelectedProviderRate] = React.useState<Rate | null>(
    serviceType === "photography" ? photographerRates[0] : serviceType === "videography" ? videographerRates[0] : null
  );

  // Value cleaner for number inputs
  const handleAmountBlur = (value: string, setter: (val: string) => void) => {
    // Remove invalid chars and format as float string
    const cleaned = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
    setter(cleaned.toFixed(2));
  };

  // ---- Render ----
  return (
    <Card shadow="none" className="p-0 border border-gray-200">
      <CardBody className="p-6 md:p-6 p-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        
        {/* Client Rate Section */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Client Rate</h4>
            <span className="text-red-500 font-semibold">*</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                role="radio"
                aria-checked={clientRateType === "existing"}
                tabIndex={0}
                className={`bg-white justify-start text-left p-4 h-auto border ${clientRateType === "existing" ? "border-primary-500" : "border-gray-200"}`}
                variant="flat"
                radius="lg"
                disableRipple
                onPress={() => setClientRateType("existing")}
                >
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                  {clientRateType === "existing" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="font-medium">Use existing rate</div>
                  <div className="text-xs text-gray-500">Select from your saved client rates</div>
                </div>
              </Button>
              <Button
                type="button"
                role="radio"
                aria-checked={clientRateType === "new"}
                tabIndex={0}
                className={`bg-white justify-start text-left p-4 h-auto border ${clientRateType === "new" ? "border-primary-500" : "border-gray-200"}`}
                variant="flat"
                radius="lg"
                disableRipple
                onPress={() => setClientRateType("new")}
                >
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                  {clientRateType === "new" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="font-medium">Create new rate</div>
                  <div className="text-xs text-gray-500">Define a custom client rate</div>
                </div>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="w-full">
                {clientRateType === "existing" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Client Rate Name<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <RateDropdown
                      label=""
                      placeholder="Select a client rate"
                      selectedRate={selectedClientRate}
                      rates={clientRates}
                      onRateChange={setSelectedClientRate}
                      onCreateNewClick={() => setClientRateType("new")}
                      isRequired
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Client Rate Name<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Standard Client Rate"
                      value={clientRateName}
                      onValueChange={setClientRateName}
                      className="w-full"
                      radius="lg"
                      variant="bordered"
                      classNames={{ inputWrapper: "h-[40px] bg-transparent" }}
                    />
                  </div>
                )}
              </div>
              <div className="w-full">
                {clientRateType === "new" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Currency
                      </label>
                      <Select
                        selectedKeys={[clientRateCurrency]}
                        onSelectionChange={keys => setClientRateCurrency(Array.from(keys)[0] as string)}
                        className="w-full"
                        radius="lg"
                        variant="bordered"
                        classNames={{ trigger: "h-[40px] bg-transparent" }}
                      >
                        {currencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={clientRateAmount}
                        onValueChange={setClientRateAmount}
                        onBlur={e => handleAmountBlur(e.target.value, setClientRateAmount)}
                        className="w-full"
                        radius="lg"
                        variant="bordered"
                        classNames={{ inputWrapper: "h-[40px] bg-transparent" }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Unit
                      </label>
                      <Select
                        selectedKeys={[clientRateUnit]}
                        onSelectionChange={keys => setClientRateUnit(Array.from(keys)[0] as string)}
                        className="w-full"
                        radius="lg"
                        variant="bordered"
                        classNames={{ trigger: "h-[40px] bg-transparent" }}
                      >
                        {unitOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {clientRateType === "new" && (
              <div className="flex justify-end">
                <Button color="primary" size="sm" onPress={() => { /* TODO: Implement Create Rate logic */ }}>
                  Create Rate
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Provider Rate Section */}
        {(serviceType === "photography" || serviceType === "videography") && (
          <div>
            <div className="flex items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                {serviceType === "photography" ? "Photographer Rate" : "Videographer Rate"}
              </h4>
              <span className="text-red-500 font-semibold">*</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  role="radio"
                  aria-checked={providerRateType === "existing"}
                  tabIndex={0}
                  className={`bg-white justify-start text-left p-4 h-auto border ${providerRateType === "existing" ? "border-primary-500" : "border-gray-200"}`}
                  variant="flat"
                  radius="lg"
                  disableRipple
                  onPress={() => setProviderRateType("existing")}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                    {providerRateType === "existing" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">Use existing rate</div>
                    <div className="text-xs text-gray-500">
                      Select from your saved {serviceType === "photography" ? "photographer" : "videographer"} rates
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  role="radio"
                  aria-checked={providerRateType === "new"}
                  tabIndex={0}
                  className={`bg-white justify-start text-left p-4 h-auto border ${providerRateType === "new" ? "border-primary-500" : "border-gray-200"}`}
                  variant="flat"
                  radius="lg"
                  disableRipple
                  onPress={() => setProviderRateType("new")}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2">
                    {providerRateType === "new" && <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium">Create new rate</div>
                    <div className="text-xs text-gray-500">Define a custom rate</div>
                  </div>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full">
                  {providerRateType === "existing" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {serviceType === "photography" ? "Photographer" : "Videographer"} Rate Name
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <RateDropdown
                        label=""
                        placeholder={`Select a ${serviceType === "photography" ? "photographer" : "videographer"} rate`}
                        selectedRate={selectedProviderRate}
                        rates={serviceType === "photography" ? photographerRates : videographerRates}
                        onRateChange={setSelectedProviderRate}
                        onCreateNewClick={() => setProviderRateType("new")}
                        isRequired
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {serviceType === "photography" ? "Photographer" : "Videographer"} Rate Name
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <Input
                        placeholder={`e.g. Standard ${serviceType === "photography" ? "Photographer" : "Videographer"} Rate`}
                        value={providerRateName}
                        onValueChange={setProviderRateName}
                        className="w-full"
                        radius="lg"
                        variant="bordered"
                        classNames={{ inputWrapper: "h-[40px] bg-transparent" }}
                      />
                    </div>
                  )}
                </div>
                <div className="w-full">
                  {providerRateType === "new" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Currency
                        </label>
                        <Select
                          selectedKeys={[providerRateCurrency]}
                          onSelectionChange={keys => setProviderRateCurrency(Array.from(keys)[0] as string)}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ trigger: "h-[40px] bg-transparent" }}
                        >
                          {currencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Amount
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={providerRateAmount}
                          onValueChange={setProviderRateAmount}
                          onBlur={e => handleAmountBlur(e.target.value, setProviderRateAmount)}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ inputWrapper: "h-[40px] bg-transparent" }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Unit
                        </label>
                        <Select
                          selectedKeys={[providerRateUnit]}
                          onSelectionChange={keys => setProviderRateUnit(Array.from(keys)[0] as string)}
                          className="w-full"
                          radius="lg"
                          variant="bordered"
                          classNames={{ trigger: "h-[40px] bg-transparent" }}
                        >
                          {unitOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {providerRateType === "new" && (
                <div className="flex justify-end">
                  <Button color="primary" size="sm" onPress={() => { /* TODO: Implement Create Rate logic */ }}>
                    Create Rate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ServiceConfigCard;