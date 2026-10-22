import { lazy, Suspense } from "react";
import { LinkOutlined } from "@ant-design/icons";
import { normalizeRichText } from "../../../text-utils";
import { Skeleton, Typography } from "antd";
import styled from "styled-components";

import { flatSection, flatSectionLabel } from "../../../theme";

// ckeditor5 is heavy: load it on demand, not with the module.
const ReferenceLinksView = lazy(() => import("@ptht365/shared-ui/editor").then((m) => ({ default: m.ReferenceLinksView })));

type Props = {
  referenceLinks: string | null;
};

/** "Add Link" block of the Info tab (BR-76, AC6/AC7 US-03, AC2 US-05). */
export default function ReferenceLinksSection({ referenceLinks }: Props): JSX.Element {
  const hasLinks = !!normalizeRichText(referenceLinks);

  return (
    <SectionStl>
      <SectionLabelStl>
        <LinkOutlined />
        <span>Add Link</span>
      </SectionLabelStl>
      {hasLinks && referenceLinks ? (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 1 }} title={false} />}>
          <ReferenceLinksView data={referenceLinks} />
        </Suspense>
      ) : (
        <Typography.Text type="secondary">Không có</Typography.Text>
      )}
    </SectionStl>
  );
}

const SectionStl = styled.div`
  ${flatSection}
`;

const SectionLabelStl = styled.div`
  ${flatSectionLabel}
`;
