import { ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";

type Props = {
  onApply: () => void;
  onReset: () => void;
};

export default function FilterFooter({ onApply, onReset }: Props): JSX.Element {
  return (
    <Flex gap={4} justify="end">
      {onReset && (
        <Button size="small" onClick={onReset} icon={<ReloadOutlined />}>
          Bỏ lọc
        </Button>
      )}
      {onApply && (
        <Button
          type="primary"
          size="small"
          onClick={onApply}
          icon={<SendOutlined />}
        >
          Áp dụng
        </Button>
      )}
    </Flex>
  );
}
