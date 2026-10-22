import IActivity from "../../../models/IActivity";
import { lazy, Suspense } from "react";
import { Skeleton } from "antd";
import { styled } from "styled-components";

// ckeditor5 is heavy: load it on demand, not with the module.
const CustomView = lazy(() => import("@ptht365/shared-ui/editor").then((m) => ({ default: m.CustomView })));

type Props = {
  activity: IActivity;
};

export default function CommentContent({ activity }: Props): JSX.Element {
  return (
    <WrapperStl>
      <Suspense fallback={<Skeleton active paragraph={{ rows: 1 }} title={false} />}>
        <CustomView data={activity.content} />
      </Suspense>
    </WrapperStl>
  );
}

const WrapperStl = styled.div`
  position: relative;
  width: fit-content;
  overflow: hidden;
`;
