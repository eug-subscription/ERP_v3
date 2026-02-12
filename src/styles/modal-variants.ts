import { tv } from "tailwind-variants";

/**
 * Shared modal style variants for centered modals across the application.
 * Used by: RateItemModal, ModifierCodeModal, RateCardCreateModal
 * 
 * Implements "Avant-Garde" premium design system with compact aesthetics.
 * @frozen - Approved visual design system
 */
export const centeredModalStyles = tv({
    slots: {
        dialog: "max-w-md w-full border-none shadow-md rounded-premium overflow-hidden bg-surface-base/95 backdrop-blur-md",
        header: "flex flex-col items-center gap-3 p-10 pt-10 pb-6 text-center",
        iconWrapper: "w-14 h-14 rounded-2xl bg-linear-to-br from-accent to-accent-600 flex items-center justify-center text-white shadow-accent-glow mb-1",
        body: "p-10 pt-0 space-y-4",
        footer: "p-10 pt-0 pb-10 flex gap-4",
        inputContainer: "group relative flex flex-col gap-1.5",
        label: "t-mini font-bold uppercase tracking-[0.15em] text-default-400 px-1 transition-colors group-focus-within:text-accent",
        input: "h-12 rounded-xl bg-default-100/50 border-transparent focus:bg-surface-base focus:border-accent/30 transition-all duration-300 px-4",
        comboInputGroup: "relative h-12 rounded-xl bg-default-100/50 border-transparent focus-within:bg-surface-base focus-within:border-accent/30 transition-all duration-300 flex items-center",
        closeButton: "right-6 top-6 bg-default-100/50 hover:bg-default-200/80 rounded-full w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-all",
        toggleContainer: "flex items-center justify-between p-4 rounded-2xl bg-default-100/30 border border-default-100/50 transition-colors hover:bg-default-100/50",
        headerDescription: "text-xs text-default-500 font-medium max-w-[240px]",
        cancelButton: "flex-1 rounded-xl h-12 font-bold text-default-500 hover:bg-default-100/50 transition-all active:scale-95",
        submitButton: "flex-1 rounded-xl h-12 font-bold bg-accent text-white shadow-accent-glow hover:bg-accent-600 transition-all active:scale-95 translate-z-0",
    }
});

/**
 * Sidebar modal style variants for right-aligned drawer modals.
 * Used by: OverrideModal (Project Pricing), TimelineConfigModal (Workflow Builder)
 * 
 * Implements full-height sidebar pattern with slide-in animation.
 * Matches RateCardEntryEditor.tsx design pattern.
 */
export const sidebarModalStyles = tv({
    slots: {
        backdrop: "backdrop-blur-md bg-black/20",
        dialog: "fixed top-0 right-0 h-screen w-full max-w-[360px] m-0 rounded-none border-l border-default-200 shadow-2xl bg-surface-base/95 backdrop-blur-md flex flex-col",
        header: "shrink-0 flex items-center justify-between p-4 border-b border-default-100 bg-transparent",
        iconWrapper: "shrink-0 w-10 h-10 rounded-xl bg-accent/[0.05] border border-accent/10 flex items-center justify-center text-accent shadow-sm",
        body: "flex-1 overflow-hidden p-0",
        footer: "shrink-0 p-4 flex gap-3 border-t border-default-100 bg-default-50/50 backdrop-blur-sm",
        closeButton: "shrink-0 w-9 h-9 flex items-center justify-center transition-colors text-default-400 hover:text-foreground hover:bg-default-100 rounded-full",
        label: "t-mini font-bold uppercase tracking-[0.15em] text-default-400",
    },
    variants: {
        isOpen: {
            true: { backdrop: "animate-backdrop-in", dialog: "animate-slide-in-right" },
            false: { backdrop: "animate-backdrop-out", dialog: "animate-slide-out-right" }
        }
    }
});
