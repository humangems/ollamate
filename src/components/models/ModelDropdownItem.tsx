import { DropdownMenu } from "@radix-ui/themes";
import { Model } from "../../lib/types";

export default function ModelsDropdownItem({model}: {model: Model}) {
  return <DropdownMenu.Item key={model.digest}>{model.name}</DropdownMenu.Item>;
}