import { DropdownMenu, Button } from "@radix-ui/themes";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { getAllModelsThunk, modelSelectors } from "../redux/slice/modelSlice";
import { selectModel } from "../redux/slice/uiSlice";
import prettyBytes from "pretty-bytes";

export default function ModelsDropdown() {

  const dispatch = useAppDispatch();
  const models = useAppSelector(state => modelSelectors.selectAll(state.models));
  const selectedId = useAppSelector(state => state.ui.selectedModel);
  const selectedModel = useAppSelector(state => modelSelectors.selectById(state.models, selectedId || ''));

  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [])

  const handleClick = (name: string) => {
    dispatch(selectModel(name));
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" color="gray" size="3" className="font-medium">
          {selectedModel ? selectedModel.name : 'Select a model'}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {models.map((model) => (
          <DropdownMenu.Item
            key={model.name}
            onClick={() => handleClick(model.name)}
            shortcut={prettyBytes(model.size)}
          >
            {model.name}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}