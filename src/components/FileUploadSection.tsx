import React from "react";
import { Icon } from "@iconify/react";
import { Button, ButtonGroup, Card, Chip, Tabs } from "@heroui/react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "completed" | "failed" | "paused";
  progress: number;
  uploaded: number;
  uploadSpeed: number;
  timeRemaining: number;
  errorMessage?: string;
  fileType: string;
}

interface FileUploadSectionProps {
  title: string;
  description: string;
  type: "unedited" | "edited";
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  title,
  description,
  type: _type,
}) => {
  const [activeTab, setActiveTab] = React.useState("all");

  const [files] = React.useState<UploadFile[]>([
    {
      id: "1",
      name: "DSC_0123.jpg",
      size: 3200000,
      status: "uploading",
      progress: 45,
      uploaded: 1440000,
      uploadSpeed: 250000,
      timeRemaining: 7,
      fileType: "image/jpeg",
    },
    {
      id: "2",
      name: "DSC_0124.jpg",
      size: 4500000,
      status: "completed",
      progress: 100,
      uploaded: 4500000,
      uploadSpeed: 0,
      timeRemaining: 0,
      fileType: "image/jpeg",
    },
    {
      id: "3",
      name: "DSC_0125.png",
      size: 6800000,
      status: "failed",
      progress: 23,
      uploaded: 1564000,
      uploadSpeed: 0,
      timeRemaining: 0,
      errorMessage: "Network error occurred",
      fileType: "image/png",
    },
    {
      id: "4",
      name: "PRODUCT_BANNER.jpg",
      size: 5100000,
      status: "paused",
      progress: 67,
      uploaded: 3417000,
      uploadSpeed: 0,
      timeRemaining: 0,
      fileType: "image/jpeg",
    },
    {
      id: "5",
      name: "DSC_0126.jpg",
      size: 2800000,
      status: "uploading",
      progress: 78,
      uploaded: 2184000,
      uploadSpeed: 320000,
      timeRemaining: 2,
      fileType: "image/jpeg",
    },
  ]);

  const fileCounts = React.useMemo(
    () => ({
      all: files.length,
      uploading: files.filter((f) => f.status === "uploading").length,
      completed: files.filter((f) => f.status === "completed").length,
      failed: files.filter((f) => f.status === "failed").length,
      paused: files.filter((f) => f.status === "paused").length,
    }),
    [files]
  );

  const filteredFiles = React.useMemo(
    () => (activeTab === "all" ? files : files.filter((f) => f.status === activeTab)),
    [files, activeTab]
  );

  const formatSize = (bytes: number) =>
    bytes < 1048576 ? (bytes / 1024).toFixed(1) + " KB" : (bytes / 1048576).toFixed(1) + " MB";

  return (
    <section className="mb-10 scroll-mt-32">
      <h2 className="text-xl font-bold mb-1 text-default-900">{title}</h2>
      <p className="text-default-500 text-sm mb-6">{description}</p>

      <Card className="bg-default-50 border-none mb-8 shadow-sm">
        <Card.Content className="p-8">
          <div className="border-2 border-dashed border-default-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-white/50 hover:bg-white hover:border-accent transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:upload-cloud" className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm font-semibold text-default-900 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-default-500">SVG, PNG, JPG or GIF (MAX. 800×400px)</p>
          </div>
        </Card.Content>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs selectedKey={activeTab} onSelectionChange={(k) => setActiveTab(k as string)}>
              <Tabs.ListContainer>
                <Tabs.List>
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
            <ButtonGroup variant="ghost">
              <Button>Pause All</Button>
              <Button className="text-danger border-danger/20 hover:bg-danger/10">
                Cancel All
              </Button>
            </ButtonGroup>
          </div>

          <div className="rounded-xl border border-default-200 overflow-hidden bg-white shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-default-50 text-default-500 font-medium border-b border-default-200">
                  <tr>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-default-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Icon icon="lucide:file" className="w-5 h-5 text-default-400" />
                          <span className="font-medium text-default-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            file.status === "completed"
                              ? "success"
                              : file.status === "failed"
                                ? "danger"
                                : "accent"
                          }
                        >
                          {file.status}
                        </Chip>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-32 space-y-1">
                          <div className="w-full bg-default-100 rounded-full h-1.5">
                            <div
                              className="bg-accent h-full rounded-full transition-all duration-500"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-default-500 font-medium">
                            {file.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-default-600 font-mono text-xs">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button isIconOnly variant="ghost">
                            <Icon icon="lucide:pause" className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            variant="ghost"
                            className="text-danger border-danger/20 hover:bg-danger/10"
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
