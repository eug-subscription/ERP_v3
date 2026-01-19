import React from "react";
import { Breadcrumbs, BreadcrumbItem, Card, CardBody, Tabs, Tab, Chip, Button, Badge, Divider, RadioGroup, Radio } from "@heroui/react";
import { Icon } from "@iconify/react";
import StatisticCard from "./components/statistic-card";
import ServiceButton from "./components/service-button";
import ServiceConfigCard from "./components/service-config-card";
import RetouchingConfigCard from "./components/retouching-config-card";

export default function App() {
  const [selectedTab, setSelectedTab] = React.useState("account");
  
  // Track selected services
  const [selectedServices, setSelectedServices] = React.useState<string[]>(["professional-photography"]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  // Handle service selection/deselection
  const toggleService = (serviceId: string) => {
    setErrorMessage(null);
    
    if (selectedServices.includes(serviceId)) {
      // Prevent deselecting the last service
      if (selectedServices.length === 1) {
        setErrorMessage("At least one service must be selected");
        return;
      }
      
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    } else {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          <Breadcrumbs className="text-sm text-gray-500 mb-3">
            <BreadcrumbItem>Projects</BreadcrumbItem>
            <BreadcrumbItem>Wolf Germany</BreadcrumbItem>
          </Breadcrumbs>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Project: Wolf Germany</h1>
          <p className="text-gray-500">A centralized view of your projects, offering quick access to essential information.</p>
        </header>
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatisticCard 
            title="Orders this month"
            value="234,420"
            change="+13.7% vs last month"
          />
          <StatisticCard 
            title="Orders this week"
            value="11,210"
            change="+15.0% vs last month"
          />
          <StatisticCard 
            title="Completed orders"
            value="316"
          />
        </div>
        
        {/* Tabs Section */}
        <div className="mb-6">
          <Tabs 
            aria-label="Project tabs" 
            selectedKey={selectedTab} 
            onSelectionChange={setSelectedTab}
            variant="light"
            radius="lg"
            classNames={{
              tab: "py-2 px-4",
              tabList: "gap-2 p-1",
              cursor: "bg-white mx-0.5 mb-0.5 mt-0.5 rounded-lg shadow-sm",
              base: "bg-gray-100 rounded-lg"
            }}
          >
            <Tab 
              key="account" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:layout-grid" className="text-lg" />
                  <span>Account details</span>
                </div>
              }
            />
            <Tab 
              key="notifications" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:bell" className="text-lg" />
                  <span>Notifications</span>
                </div>
              }
            />
            <Tab 
              key="security" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield" className="text-lg" />
                  <span>Security</span>
                </div>
              }
            />
            <Tab 
              key="managers" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:users" className="text-lg" />
                  <span>Managers</span>
                </div>
              }
            />
            <Tab 
              key="prices" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:tag" className="text-lg" />
                  <span>Prices</span>
                </div>
              }
            />
            <Tab 
              key="guidelines" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:file-text" className="text-lg" />
                  <span>Guidelines</span>
                </div>
              }
            />
            <Tab 
              key="settings" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:settings" className="text-lg" />
                  <span>Settings</span>
                </div>
              }
            />
          </Tabs>
        </div>
        
        {/* Main Content Area - Restructured grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          {/* Main Content Column */}
          <div className="space-y-6">
            {/* Service Selection Card */}
            <Card shadow="none" className="p-0 border border-gray-200">
              <CardBody className="p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-1">
                    <h2 className="text-xl font-semibold">Service Selection</h2>
                    <span className="text-red-500 font-semibold">*</span>
                  </div>
                  <p className="text-gray-500 text-sm">Select one or more services to include in this project. You can select multiple services.</p>
                </div>
                
                {/* Photography & Video Services */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Photography & Video</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <ServiceButton 
                      icon="lucide:camera" 
                      text="Professional Photography" 
                      isSelected={selectedServices.includes("professional-photography")}
                      onClick={() => toggleService("professional-photography")}
                    />
                    <ServiceButton 
                      icon="lucide:video" 
                      text="Professional Videography" 
                      isSelected={selectedServices.includes("professional-videography")}
                      onClick={() => toggleService("professional-videography")}
                    />
                    <ServiceButton 
                      icon="lucide:film" 
                      text="Simple AI-Video" 
                      isSelected={selectedServices.includes("simple-ai-video")}
                      onClick={() => toggleService("simple-ai-video")}
                    />
                    <ServiceButton 
                      icon="lucide:clapperboard" 
                      text="Advanced AI Video" 
                      isSelected={selectedServices.includes("advanced-ai-video")}
                      onClick={() => toggleService("advanced-ai-video")}
                    />
                  </div>
                </div>
                
                {/* Other Services */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Other Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <ServiceButton 
                      icon="lucide:shield-alert" 
                      text="AI-Moderation" 
                      isSelected={selectedServices.includes("ai-moderation")}
                      onClick={() => toggleService("ai-moderation")}
                    />
                    <ServiceButton 
                      icon="lucide:utensils" 
                      text="Dish Recognition" 
                      isSelected={selectedServices.includes("dish-recognition")}
                      onClick={() => toggleService("dish-recognition")}
                    />
                    <ServiceButton 
                      icon="lucide:file-text" 
                      text="Automated File Naming" 
                      isSelected={selectedServices.includes("automated-file-naming")}
                      onClick={() => toggleService("automated-file-naming")}
                    />
                    <ServiceButton 
                      icon="lucide:wand-2" 
                      text="Retouching" 
                      isSelected={selectedServices.includes("retouching")}
                      onClick={() => toggleService("retouching")}
                    />
                    <ServiceButton 
                      icon="lucide:sparkles" 
                      text="AI Personalise Generation" 
                      isSelected={selectedServices.includes("ai-personalise-generation")}
                      onClick={() => toggleService("ai-personalise-generation")}
                    />
                    <ServiceButton 
                      icon="lucide:sliders" 
                      text="Self-Service Tool" 
                      isSelected={selectedServices.includes("self-service-tool")}
                      onClick={() => toggleService("self-service-tool")}
                    />
                    <ServiceButton 
                      icon="lucide:message-square" 
                      text="Automated Messaging" 
                      isSelected={selectedServices.includes("automated-messaging")}
                      onClick={() => toggleService("automated-messaging")}
                    />
                    <ServiceButton 
                      icon="lucide:list-checks" 
                      text="Menu Creation" 
                      isSelected={selectedServices.includes("menu-creation")}
                      onClick={() => toggleService("menu-creation")}
                    />
                    <ServiceButton 
                      icon="lucide:bar-chart-2" 
                      text="Analytics Portal" 
                      isSelected={selectedServices.includes("analytics-portal")}
                      onClick={() => toggleService("analytics-portal")}
                    />
                    <ServiceButton 
                      icon="lucide:wand" 
                      text="Creative Director" 
                      isSelected={selectedServices.includes("creative-director")}
                      onClick={() => toggleService("creative-director")}
                    />
                    <ServiceButton 
                      icon="lucide:database" 
                      text="Storage Fee" 
                      isSelected={selectedServices.includes("storage-fee")}
                      onClick={() => toggleService("storage-fee")}
                    />
                    <ServiceButton 
                      icon="lucide:eye" 
                      text="AI Moderation" 
                      isSelected={selectedServices.includes("ai-moderation")}
                      onClick={() => toggleService("ai-moderation")}
                    />
                  </div>
                </div>
                
                {/* Error message */}
                {errorMessage && (
                  <div className="mt-4 text-red-500 text-sm">
                    <Icon icon="lucide:alert-circle" className="inline-block mr-1" />
                    {errorMessage}
                  </div>
                )}
              </CardBody>
            </Card>
            
            {/* Service Configuration Cards - MOVED FROM SIDEBAR TO MAIN CONTENT */}
            {selectedServices.includes("professional-photography") && (
              <ServiceConfigCard 
                title="Professional Photography"
                description="Professional photography services for your project"
                serviceType="photography"
              />
            )}
            
            {/* Professional Videography Config */}
            {selectedServices.includes("professional-videography") && (
              <ServiceConfigCard 
                title="Professional Videography"
                description="Professional video production services"
                serviceType="videography"
              />
            )}
            
            {/* Retouching Config - Special Case */}
            {selectedServices.includes("retouching") && (
              <RetouchingConfigCard />
            )}
            
            {/* Other Services - Client Rate Only */}
            {selectedServices.filter(service => 
              !["professional-photography", "professional-videography", "retouching"].includes(service)
            ).map(service => (
              <ServiceConfigCard 
                key={service}
                title={service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                description={`${service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} services for your project`}
                serviceType="client-only"
              />
            ))}
          </div>
          
          {/* Sidebar Column - No extra spacing */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <Card shadow="none" className="p-0 border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4">Project info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:calendar" className="text-gray-400" />
                    <span className="text-sm text-gray-600">Created on Jan 10, 2023</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:user" className="text-gray-400" />
                    <span className="text-sm text-gray-600">Created by [user name]</span>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            {/* Tags Card */}
            <Card shadow="none" className="p-0 border border-gray-200">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip 
                    variant="flat"
                    color="default"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Food photography
                  </Chip>
                  <Chip 
                    variant="flat"
                    color="default"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Wolf Germany
                  </Chip>
                  <Chip 
                    variant="flat"
                    color="default"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Wolf Food App
                  </Chip>
                  <Chip 
                    variant="flat"
                    color="default"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    Editing
                  </Chip>
                </div>
                <Button 
                  variant="light" 
                  size="sm" 
                  startContent={<Icon icon="lucide:plus" size={16} />}
                >
                  Add more
                </Button>
              </CardBody>
            </Card>
            
            {/* REMOVED: Service Configuration Cards section from sidebar */}
          </div>
        </div>
      </div>
    </div>
  );
}