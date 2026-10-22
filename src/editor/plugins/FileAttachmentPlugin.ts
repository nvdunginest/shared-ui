import { ButtonView, Command, Plugin } from "ckeditor5";

export type AttachmentData = {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string; // base64
};

/**
 * Custom plugin for CKEditor 5 to handle file attachments
 * Converts files to base64 and stores them in attachment markers
 */
export default class FileAttachmentPlugin extends Plugin {
  private attachments: Map<string, AttachmentData> = new Map();
  private attachmentCounter = 0;

  static get pluginName() {
    return "FileAttachment";
  }

  init() {
    const editor = this.editor;

    editor.commands.add(
      "fileAttachment",
      new FileAttachmentCommand(editor, this),
    );

    editor.ui.componentFactory.add("fileAttachment", (locale: any) => {
      const button = new ButtonView(locale);
      button.set({
        label: "Attach File",
        tooltip: true,
        withText: false,
        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M14.4 6.9l-5.3 5.3a2.5 2.5 0 11-3.5-3.5l5.6-5.6a4 4 0 115.7 5.7l-6 6a5.5 5.5 0 11-7.8-7.8l5.8-5.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      });

      button.on("execute", () => {
        editor.execute("fileAttachment");
      });

      return button;
    });

    // Define schema for attachment marker
    editor.model.schema.register("attachment", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["attachmentId"],
    });

    // Model to data view conversion
    editor.conversion.for("dataDowncast").elementToElement({
      model: "attachment",
      view: (modelElement: any, { writer }: any) => {
        const attachmentId = modelElement.getAttribute(
          "attachmentId",
        ) as string;
        const data = this.attachments.get(attachmentId);

        if (!data) return writer.createText("");

        const element = writer.createEmptyElement("span", {
          class: "ck-attachment-widget",
          "data-attachment-id": attachmentId,
          "data-file-name": data.fileName,
          "data-file-size": data.fileSize,
          "data-file-type": data.fileType,
          "data-file-data": data.fileData,
        });

        return element;
      },
    });

    // Model to editing view conversion
    editor.conversion.for("editingDowncast").elementToElement({
      model: "attachment",
      view: (modelElement: any, { writer }: any) => {
        const attachmentId = modelElement.getAttribute(
          "attachmentId",
        ) as string;
        const data = this.attachments.get(attachmentId);

        if (!data) return writer.createText("");

        const container = writer.createContainerElement("span", {
          class: "ck-attachment-widget ck-widget",
          "data-attachment-id": attachmentId,
          "data-file-name": data.fileName,
          "data-file-size": data.fileSize,
          "data-file-type": data.fileType,
          "data-file-data": data.fileData,
        });

        const icon = writer.createEmptyElement("span", {
          class: "ck-attachment-icon",
        });

        const info = writer.createContainerElement("span", {
          class: "ck-attachment-info",
        });

        const nameEl = writer.createText(data.fileName);
        const sizeEl = writer.createText(
          ` (${this.formatFileSize(data.fileSize)})`,
        );

        writer.insert(writer.createPositionAt(info, 0), nameEl);
        writer.insert(writer.createPositionAt(info, "end"), sizeEl);
        writer.insert(writer.createPositionAt(container, 0), icon);
        writer.insert(writer.createPositionAt(container, "end"), info);

        return container;
      },
    });

    // Data view to model conversion. This allows loading saved HTML back into the editor/view.
    editor.conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: "ck-attachment-widget",
      },
      model: (viewElement: any, { writer }: any) => {
        const attachmentIdFromData = viewElement.getAttribute(
          "data-attachment-id",
        ) as string | undefined;
        const attachmentId =
          attachmentIdFromData || `att_${this.attachmentCounter++}`;

        const fileName =
          (viewElement.getAttribute("data-file-name") as string | undefined) ||
          "attachment";
        const fileSizeAttr = viewElement.getAttribute("data-file-size") as
          | string
          | undefined;
        const fileType =
          (viewElement.getAttribute("data-file-type") as string | undefined) ||
          "";
        const fileData =
          (viewElement.getAttribute("data-file-data") as string | undefined) ||
          "";

        this.attachments.set(attachmentId, {
          fileName,
          fileSize: Number(fileSizeAttr || 0),
          fileType,
          fileData,
        });

        const parsedCounter = Number(attachmentId.replace("att_", ""));
        if (!Number.isNaN(parsedCounter)) {
          this.attachmentCounter = Math.max(
            this.attachmentCounter,
            parsedCounter + 1,
          );
        }

        return writer.createElement("attachment", { attachmentId });
      },
    });
  }

  triggerAttachmentDialog(maxFileSize: number = 15 * 1024 * 1024): void {
    const editor = this.editor;
    this.insertFileAttachment(editor, maxFileSize);
  }

  getAttachments(): Map<string, AttachmentData> {
    return this.attachments;
  }

  addAttachment(data: AttachmentData): string {
    const id = `att_${this.attachmentCounter++}`;
    this.attachments.set(id, data);
    return id;
  }

  removeAttachment(id: string): void {
    this.attachments.delete(id);
  }

  private insertFileAttachment(editor: any, maxFileSize: number): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";

    input.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > maxFileSize) {
        alert(
          `File không thể lớn hơn 15MB! File của bạn: ${this.formatFileSize(file.size)}`,
        );
        return;
      }

      try {
        const base64 = await this.fileToBase64(file);
        const attachmentId = this.addAttachment({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: base64,
        });

        const model = editor.model;
        model.change((writer: any) => {
          const attachmentElement = writer.createElement("attachment", {
            attachmentId,
          });

          model.insertContent(attachmentElement);
        });
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Lỗi khi đọc file");
      }
    });

    input.click();
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

class FileAttachmentCommand extends Command {
  declare value: unknown;

  private plugin: FileAttachmentPlugin;

  constructor(editor: any, plugin: FileAttachmentPlugin) {
    super(editor);
    this.plugin = plugin;
  }

  refresh() {
    this.isEnabled = true;
  }

  execute() {
    this.plugin.triggerAttachmentDialog();
  }
}
