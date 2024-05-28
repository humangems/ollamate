import { Select } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { getAllModelsThunk, modelSelectors } from '../redux/slice/modelSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

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
  }, []);

  useEffect(() => {
    setInternalValue(value);
  }, [value])

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }

  return (
    <Select.Root value={internalValue} onValueChange={handleChange} size="3">
      <Select.Trigger placeholder='Select a model' variant='ghost' color="gray"></Select.Trigger>
      <Select.Content color='gray'>
        {models.map((model) => (
          <Select.Item key={model.name} value={model.name}>{model.name}</Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
