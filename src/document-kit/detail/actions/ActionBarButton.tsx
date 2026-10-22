import { Button } from "antd";
import { css, styled } from "styled-components";

import { colors, radii } from "../../../theme";

// Style dùng chung cho toàn bộ nút trong action bar (Document Detail).
export type ActionBarButtonTone = "primary" | "danger" | "info" | "warning" | "neutral";

// Màu theo EO cũ: chỉ nút phê duyệt (primary) tô màu đặc; mọi nút còn lại nền trắng, chữ + viền cam.
const APPROVE_COLOR = "#A55018";
const APPROVE_HOVER = "#8C4313";

const outlineStyle = css`
  background: #fff;
  color: ${APPROVE_COLOR};
  border: 1px solid ${APPROVE_COLOR} !important;
  &:hover,
  &:focus {
    background: ${colors.primaryBg} !important;
    color: ${APPROVE_COLOR} !important;
    border-color: ${APPROVE_COLOR} !important;
  }
`;

const toneStyles: Record<ActionBarButtonTone, ReturnType<typeof css>> = {
  primary: css`
    background: ${APPROVE_COLOR};
    color: #fff;
    &:hover,
    &:focus {
      background: ${APPROVE_HOVER} !important;
      color: #fff !important;
    }
  `,
  danger: outlineStyle,
  info: outlineStyle,
  warning: outlineStyle,
  neutral: outlineStyle,
};

const ActionBarButton = styled(Button)<{ $tone?: ActionBarButtonTone }>`
  border: none;
  border-radius: ${radii.sm}px !important;
  font-weight: 600;
  box-shadow: none !important;
  ${({ $tone = "neutral" }) => toneStyles[$tone]}
`;

export default ActionBarButton;
