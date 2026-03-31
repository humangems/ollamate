import { ChevronRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getAllModelsThunk,
  modelSelectors,
  updateLastUsedModelNameThunk,
} from '../redux/slice/modelSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type ModelSelectProps = {
  value: string;
  onChange?: (value: string) => void;
};

export default function ModelSelect({ value, onChange }: ModelSelectProps) {
  const dispatch = useAppDispatch();
  const models = useAppSelector((state) => modelSelectors.selectAll(state.models));

  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    dispatch(updateLastUsedModelNameThunk(newValue));
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="no-drag-region">
        <Button variant="ghost" size="sm">
          <span>{internalValue || 'Select a model'}</span>
          <ChevronRightIcon className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={internalValue} onValueChange={handleChange}>
          {models.map((model) => (
            <DropdownMenuRadioItem key={model.name} value={model.name}>
              {model.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
