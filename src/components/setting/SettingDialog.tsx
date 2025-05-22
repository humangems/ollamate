import { hideSetting } from '../../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useForm } from '@mantine/form';
import {
  OllamaServerConfig,
  getOllamaServerConfig,
  setOllamaServerConfig,
} from '../../lib/settingApi';
import { useEffect } from 'react';
import CheckButton from './CheckButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

type FormValues = {
  ollamaServerUrl: string;
  customOllamaServer: boolean;
};

export default function SettingDialog() {
  const settingOpen = useAppSelector((state) => state.ui.settingOpen);
  const dispatch = useAppDispatch();
  const form = useForm<FormValues>();

  useEffect(() => {
    getOllamaServerConfig().then((config) => {
      form.setFieldValue('ollamaServerUrl', config.url);
      form.setFieldValue('customOllamaServer', config.custom);
    });
  }, [settingOpen]);

  const handleChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch(hideSetting());
      form.reset();
    }
  };

  const handleSubmit = (values: FormValues) => {
    const config: OllamaServerConfig = {
      custom: values.customOllamaServer,
      url: values.ollamaServerUrl,
    };
    setOllamaServerConfig(config);
    dispatch(hideSetting());
    window.location.reload();
  };

  const handleCheckChange = (value: boolean) => {
    form.setFieldValue('customOllamaServer', value);
  };

  return (
    <Dialog open={settingOpen} onOpenChange={handleChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setting</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Switch
            id="switchCustomServer"
            checked={form.values.customOllamaServer}
            onCheckedChange={handleCheckChange}
          />
          <Label htmlFor="switchCustomServer">Customize Ollama Server</Label>
        </div>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div className="pl-11 mt-2">
            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                {...form.getInputProps('ollamaServerUrl')}
                disabled={!form.values.customOllamaServer}
              />
              <CheckButton url={form.values.ollamaServerUrl} />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
