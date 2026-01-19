import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ServiceButtonProps {
  icon: string;
  text: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({ icon, text, isSelected = false, onClick }) => {
  return (
    <Button
      className="h-10 w-full justify-start pl-3 pr-4 min-w-[160px]"
      variant={isSelected ? "solid" : "bordered"}
      color="primary"
      radius="md"
      onPress={onClick}
    >
      <div className="flex items-center">
        <Icon 
          icon={icon} 
          width={16}
          height={16}
          className="flex-shrink-0"
        />
        <span 
          className="text-xs font-medium truncate text-left ml-1.5 flex-shrink-0 mt-0.5" 
          title={text}
        >
          {text}
        </span>
      </div>
    </Button>
  );
};

export default ServiceButton;