import { Icon } from "@iconify/react";
import { Button, ButtonGroup, Card, Chip, Tabs, Alert, Skeleton } from "@heroui/react";
import { useUpload } from "../hooks/useUpload";
import { EmptyState } from "./pricing/EmptyState";
import { UploadDropZone } from "./UploadDropZone";
import { UploadFileTable } from "./UploadFileTable";
import { CARD_HEADER, ICON_CONTAINER_LG, ICON_SIZE_CONTAINER, TEXT_SECTION_TITLE } from "../constants/ui-tokens";

interface FileUploadSectionProps {
  title: string;
  description: string;
}

export function FileUploadSection({
  title,
  description,
}: FileUploadSectionProps) {
  const { filteredFiles, fileCounts, activeTab, isLoading, error, setActiveTab, refetch, togglePause, retryFile, cancelFile } = useUpload();

  if (isLoading) {
    return (
      <section className="mb-10 scroll-mt-32">
        <Skeleton className="h-8 w-64 rounded-lg mb-2" />
        <Skeleton className="h-4 w-96 rounded-lg mb-6" />
        <Card className="bg-default-50 border-none shadow-sm">
          <Card.Content className="p-8">
            <Skeleton className="h-48 rounded-2xl mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </Card.Content>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-10 scroll-mt-32">
        <Card>
          <Card.Content className="p-6">
            <Alert status="danger" className="rounded-2xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="font-bold">Error Loading Upload Files</Alert.Title>
                <Alert.Description>Failed to fetch upload data. Please try again.</Alert.Description>
                <Button
                  size="sm"
                  variant="danger-soft"
                  onPress={() => refetch()}
                  className="font-bold mt-2"
                >
                  Retry
                </Button>
              </Alert.Content>
            </Alert>
          </Card.Content>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-10 scroll-mt-32">
      <Card>
        <Card.Header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${CARD_HEADER}`}>
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <div className={ICON_CONTAINER_LG}>
                <Icon icon="lucide:upload-cloud" className={ICON_SIZE_CONTAINER} />
              </div>
              <div>
                <h2 className={`${TEXT_SECTION_TITLE} flex items-center gap-3`}>
                  {title}
                  <Chip size="sm" variant="soft" color="accent" className="font-black px-2">
                    {fileCounts.all}
                  </Chip>
                </h2>
                <p className="text-xs text-default-400 font-medium">{description}</p>
              </div>
            </div>

            {fileCounts.all > 0 && (
              <ButtonGroup variant="ghost">
                <Button>Pause All</Button>
                <Button className="text-danger border-danger/20 hover:bg-danger/10">
                  Cancel All
                </Button>
              </ButtonGroup>
            )}
          </div>
        </Card.Header>

        <Card.Content className="p-0">
          <UploadDropZone />

          {fileCounts.all === 0 && (
            <EmptyState
              icon="lucide:upload-cloud"
              title="No files uploaded"
              description="Drag and drop files into the zone above or click to browse your device."
            />
          )}

          {fileCounts.all > 0 && (
            <>
              <div className="px-8 pb-4">
                <Tabs selectedKey={activeTab} onSelectionChange={(k) => setActiveTab(k as string)}>
                  <Tabs.ListContainer>
                    <Tabs.List aria-label="Upload file filters">
                      <Tabs.Tab id="all">
                        All ({fileCounts.all})
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="uploading">
                        Uploading ({fileCounts.uploading})
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="completed">
                        Completed ({fileCounts.completed})
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="failed">
                        Failed ({fileCounts.failed})
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
              </div>

              <UploadFileTable
                files={filteredFiles}
                activeTab={activeTab}
                onClearFilter={() => setActiveTab("all")}
                onTogglePauseFile={togglePause}
                onRetryFile={retryFile}
                onCancelFile={cancelFile}
              />
            </>
          )}
        </Card.Content>
      </Card>
    </section>
  );
}
