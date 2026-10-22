import { colors, radii } from "../../theme";
import styled from "styled-components";

import SelectUser from "./SelectUser";

// Chip nền xám nhạt bo tròn cho selection item — dùng chung giữa
// AddFollowersAction và CreateDocument thay vì lặp lại override riêng.
const SelectUserChip = styled(SelectUser)`
  .ant-select-selection-item {
    border-radius: ${radii.pill}px !important;
    background: ${colors.bgChip} !important;
    border: none !important;
  }
`;

export default SelectUserChip;
