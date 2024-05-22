import { DropdownMenu, Button } from "@radix-ui/themes";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { getAllModelsThunk, modelSelectors } from "../redux/slice/modelSlice";
import ModelsDropdownItem from "./models/ModelDropdownItem";

export default function ModelsDropdown() {

  const dispatch = useAppDispatch();
  const models = useAppSelector(state => modelSelectors.selectAll(state.models));
  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [])

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" color="gray">
          Llama 3
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {models.map((model) => (
          <ModelsDropdownItem model={model} key={model.digest} />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}