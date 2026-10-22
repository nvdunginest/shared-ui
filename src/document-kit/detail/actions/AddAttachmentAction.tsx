import { useDocumentKit } from "../../config";
import { getUiConfig } from "../../../ui";
import { useEffect, useRef, useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useDocumentContext } from "../../context/document/index";
import { useGlobalContext } from "../../index";
import attachmentsController from "../../api/attachments.controller";
import type { IDepartment } from "../../../mdms";
import { useAppContext } from "../../../platform-kit";
import { filesHelper } from "../../../platform-kit";
import { useModuleFeedback } from "@ptht365/shared-ui/module-contract";
import { Button } from "antd";
import { UUID } from "crypto";

export function CheckActor(
  companyId: UUID | undefined,
  userId: UUID | undefined,
  positionId: UUID,
  departments: IDepartment[],
): boolean {
  if (companyId === undefined || userId === undefined) return false;

  const position = departments
    .filter(d => d.companyId === companyId)
    .flatMap(d => d.positions)
    .find(p => p.id === positionId && p.userId === userId.toString());

  if (position == null)
    return false;

  return true;
}

export default function AddAttachmentAction(): JSX.Element {
  const { detail } = useDocumentKit();
  const { message } = useModuleFeedback();
  const { userId } = useAppContext().state;
  const { departments } = useGlobalContext().globalState;
  const { state } = useDocumentContext();

  const [enable, setEnable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (file: File) => {
    if (state.document === null) return;
    setIsLoading(true);
    try {
      const storageId = await filesHelper.upload(file, {
        onProgress: (percent) => setProgress(Math.round(percent * 100)),
      });

      if (storageId === null) return;

      await attachmentsController.addAttachment(state.document.id, {
        filename: file.name,
        storageId,
        size: file.size,
      });
      setProgress(0);
    } catch {
      // console.print("Attachments - Create attachment", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.document === null) {
      setEnable(false);
      return;
    }

    if (
      !detail.statuses.notEnded.includes(state.document.status)
    ) {
      setEnable(false);
      return;
    }

    if (!CheckActor(state.document.companyId, userId, state.document.processorPositionId, departments)) {
      setEnable(false);
      return;
    }

    setEnable(true);
     
  }, [state.document, userId, departments]);

  return (
    <>
      {enable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.pptx"
            multiple={false}
            hidden
            onChange={(e) => {
              if (e.target.files) {
                if (e.target.files[0].size < 15 * (1000 * 1000)) {
                  handleSubmit(e.target.files[0]);
                } else {
                  message.error(`Không thể upload file lớn hơn 15MB!`);
                }
                e.target.value = "";
              }
            }}
          />
          <Button
            icon={<PlusCircleOutlined />}
            type="primary"
            size="small"
            loading={isLoading}
            onClick={() => inputRef.current?.click()}
          >
            {progress === 0 ? "Thêm" : `${progress}%`}
          </Button>
        </>
      )}
    </>
  );
}
