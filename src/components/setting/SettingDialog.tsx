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
import { ModeToggle } from './ModeToggle';

type FormValues = {
  ollamaServerUrl: string;
  customOllamaServer: boolean;
};

export default function SettingDialog() {
  const settingOpen = useAppSelector((state) => state.ui.settingOpen);
  const dispatch = useAppDispatch();
  const form = useForm<FormValues>({
    initialValues: {
      ollamaServerUrl: '',
      customOllamaServer: false,
    },
  });

  useEffect(() => {
    if (!settingOpen) return;

    let active = true;
    getOllamaServerConfig().then((config) => {
      if (!active) return;
      form.setValues({
        ollamaServerUrl: config.url,
        customOllamaServer: config.custom,
      });
    });

    return () => {
      active = false;
    };
    // Mantine's form object is not stable enough for this dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className=" gap-4 divide-y">
          <div className="flex items-center justify-between py-4">
            <Label>Theme</Label>
            <ModeToggle />
          </div>

          <div className="py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="switchCustomServer">Customize Ollama Server</Label>
              <Switch
                id="switchCustomServer"
                checked={form.values.customOllamaServer}
                onCheckedChange={handleCheckChange}
              />
            </div>
            {form.values.customOllamaServer && (
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      {...form.getInputProps('ollamaServerUrl')}
                      disabled={!form.values.customOllamaServer}
                    />
                    <CheckButton url={form.values.ollamaServerUrl} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <Button type="submit">Save</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
