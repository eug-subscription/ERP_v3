import React from "react";
import { Icon } from "@iconify/react";

export function Header() {
  const steps = [
    { label: "Home", icon: "lucide:home", href: "#" },
    { label: "Projects", href: "#" },
    { label: "Wolt Germany", href: "#" },
    { label: "Orders", href: "#" },
    { label: "Burger King | Order 123456", isCurrent: true },
  ];

  return (
    <header className="bg-white border-b border-default-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="py-2.5">
          <a
            href="#"
            className="inline-flex items-center text-accent text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5 mr-2" />
            Back to all orders
          </a>
        </div>

        <div className="py-3 flex items-center overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-2 text-sm text-default-500 whitespace-nowrap">
            {steps.map((step, index) => (
              <React.Fragment key={step.label}>
                {index > 0 && (
                  <Icon
                    icon="lucide:chevron-right"
                    className="w-3.5 h-3.5 text-default-300 flex-shrink-0"
                  />
                )}
                {step.isCurrent ? (
                  <span className="font-bold text-default-900 border-b-2 border-accent pb-0.5">
                    {step.label}
                  </span>
                ) : (
                  <a
                    href={step.href}
                    className="flex items-center hover:text-default-900 transition-colors"
                  >
                    {step.icon && <Icon icon={step.icon} className="w-3.5 h-3.5 mr-1.5" />}
                    {step.label}
                  </a>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
