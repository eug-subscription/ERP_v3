import { Icon } from "@iconify/react";
import { CANVAS_BLOCK_WIDTH } from "../constants";

export function StartNode() {
    return (
        <div className="flex flex-col items-center select-none">
            <div
                className="relative z-10 flex items-center gap-3 px-4 py-3 border-2 border-success rounded-xl shadow-sm bg-success/10"
                style={{ width: CANVAS_BLOCK_WIDTH }}
            >
                {/* Fixed Icon container */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success text-white shrink-0">
                    <Icon
                        icon="lucide:play"
                        className="w-4 h-4 ml-0.5"
                    />
                </div>

                <div className="flex flex-col min-w-0 text-left">
                    <span className="text-sm font-bold text-success-700 leading-tight truncate">
                        Order Created
                    </span>
                    <span className="text-xs font-medium text-success-600/80 truncate">
                        Workflow starts here
                    </span>
                </div>
            </div>
        </div>
    );
}
