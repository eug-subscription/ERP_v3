import { ProAssigningConfig } from "../../WorkflowTab/ProAssigningConfig";
import { ModerationConfig } from "../../WorkflowTab/ModerationConfig";
import { ConditionalConfig } from "../../WorkflowTab/ConditionalConfig";
import { SSTConfig } from "../../WorkflowTab/SSTConfig";
import { RetoucherAssigningConfig } from "../../WorkflowTab/RetoucherAssigningConfig";
import { ExternalProcessConfig } from "../../WorkflowTab/ExternalProcessConfig";
import { SendNotificationConfig } from "../../WorkflowTab/SendNotificationConfig";
import { FileStorageConfig } from "../../WorkflowTab/FileStorageConfig";
import { FileRenamingConfig } from "../../WorkflowTab/FileRenamingConfig";
import { BlockDescriptionPanel } from "../../WorkflowTab/BlockDescriptionPanel";
import {
    CanvasBlock,
    BlockConfig,
    ProAssigningConfig as ProAssigningConfigType,
    ModerationConfig as ModerationConfigType,
    IfElseConfig as IfElseConfigType,
    SSTConfig as SSTConfigType,
    RetoucherAssigningConfig as RetoucherAssigningConfigType,
    ExternalProcessConfig as ExternalProcessConfigType,
    SendNotificationConfig as SendNotificationConfigType,
    FileStorageConfig as FileStorageConfigType,
    FileRenamingConfig as FileRenamingConfigType
} from "../../../../types/workflow";
import { BLOCK_LIBRARY } from "../../../../data/block-ui-categories";
import { MASTER_BLOCKS } from "../../../../data/master-blocks";
import { useMemo } from "react";

interface BlockConfigFormProps {
    block: CanvasBlock;
    availableBlocks: CanvasBlock[];
    onUpdate: (config: BlockConfig) => void;
}

/**
 * Router component that renders the appropriate configuration form 
 * based on the block type.
 */
export function BlockConfigForm({ block, availableBlocks, onUpdate }: BlockConfigFormProps) {
    const blockInfo = useMemo(() => {
        return BLOCK_LIBRARY.find(b => b.type === block.type);
    }, [block.type]);

    // Handle blocks that don't have configuration components
    const renderDescription = () => (
        <BlockDescriptionPanel
            title="Block Information"
            icon={blockInfo?.icon || 'lucide:info'}
            description={blockInfo?.description || 'No description available for this block.'}
        />
    );

    // Use current config or fallback to master default if it exists
    const config = block.config || MASTER_BLOCKS[block.type]?.config;

    if (!config) {
        return renderDescription();
    }

    switch (block.type) {
        case 'PRO_ASSIGNING':
            return <ProAssigningConfig
                config={config as ProAssigningConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'RETOUCHER_ASSIGNING':
            return <RetoucherAssigningConfig
                config={config as RetoucherAssigningConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'SST':
            return <SSTConfig
                config={config as SSTConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'MODERATION':
            return (
                <ModerationConfig
                    config={config as ModerationConfigType}
                    availableSteps={availableBlocks}
                    onUpdate={(cfg) => onUpdate(cfg)}
                />
            );

        case 'IF_ELSE':
            return (
                <ConditionalConfig
                    config={config as IfElseConfigType}
                    availableSteps={availableBlocks}
                    onUpdate={(cfg) => onUpdate(cfg)}
                />
            );

        case 'EXTERNAL_PROCESS':
            return <ExternalProcessConfig
                config={config as ExternalProcessConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'SEND_NOTIFICATION':
            return <SendNotificationConfig
                config={config as SendNotificationConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'FILE_STORAGE':
            return <FileStorageConfig
                config={config as FileStorageConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        case 'FILE_RENAMING':
            return <FileRenamingConfig
                config={config as FileRenamingConfigType}
                onUpdate={(cfg) => onUpdate(cfg)}
            />;

        default:
            return renderDescription();
    }
}
