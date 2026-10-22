import {
  ClipboardPipeline,
  Plugin,
  UpcastWriter,
  type ViewDocumentFragment,
  type ViewElement,
} from "ckeditor5";

// Only http(s) and www. addresses: javascript:/data: text is never turned into a link.
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
// Punctuation that normally ends the sentence, not the address.
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

type TextPart = { text: string; href?: string };

function splitByUrls(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = match[0].replace(TRAILING_PUNCTUATION, "");
    if (url.length === 0) continue;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ text: url, href: /^www\./i.test(url) ? `https://${url}` : url });
    last = start + url.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

function linkify(writer: UpcastWriter, parent: ViewElement | ViewDocumentFragment): void {
  for (const child of Array.from(parent.getChildren())) {
    if (child.is("$text")) {
      const parts = splitByUrls(child.data);
      if (!parts.some((part) => part.href)) continue;
      const nodes = parts.map((part) =>
        part.href
          ? writer.createElement("a", { href: part.href }, [writer.createText(part.text)])
          : writer.createText(part.text),
      );
      const index = parent.getChildIndex(child);
      writer.remove(child);
      writer.insertChild(index, nodes, parent);
    } else if (child.is("element") && child.name !== "a") {
      linkify(writer, child);
    }
  }
}

/**
 * AutoLink only turns a URL into a link while it is typed. This plugin does the same for pasted
 * content: every http(s):// or www. address in the pasted text (or HTML) becomes a link.
 */
export default class PasteAutoLink extends Plugin {
  static get pluginName() {
    return "PasteAutoLink" as const;
  }

  static get requires() {
    return [ClipboardPipeline] as const;
  }

  init() {
    const { editor } = this;
    // Runs before the pipeline converts the pasted view into the model (its listener is 'low').
    this.listenTo(editor.plugins.get(ClipboardPipeline), "inputTransformation", (_event, data) => {
      linkify(new UpcastWriter(editor.editing.view.document), data.content);
    });
  }
}
