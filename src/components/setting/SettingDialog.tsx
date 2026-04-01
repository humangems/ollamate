import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { hideSetting } from '../../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  DEFAULT_OLLAMA_SERVER_CONFIG,
  OllamaServerConfig,
  getOllamaServerConfig,
  setOllamaServerConfig,
} from '../../lib/settingApi';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import CheckButton from './CheckButton';
import { ModeToggle } from './ModeToggle';

const formSchema = z
  .object({
    ollamaServerUrl: z.string().trim(),
    customOllamaServer: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.customOllamaServer) return;

    if (!values.ollamaServerUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter an Ollama server URL.',
        path: ['ollamaServerUrl'],
      });
      return;
    }

    if (!z.url().safeParse(values.ollamaServerUrl).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid URL, including the protocol.',
        path: ['ollamaServerUrl'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  ollamaServerUrl: DEFAULT_OLLAMA_SERVER_CONFIG.url,
  customOllamaServer: false,
};

export default function SettingDialog() {
  const settingOpen = useAppSelector((state) => state.ui.settingOpen);
  const dispatch = useAppDispatch();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const customServerEnabled = useWatch({ control, name: 'customOllamaServer' });
  const serverUrl = useWatch({ control, name: 'ollamaServerUrl' });

  useEffect(() => {
    if (!settingOpen) return;

    let active = true;

    getOllamaServerConfig().then((config) => {
      if (!active) return;

      reset({
        ollamaServerUrl: config.url,
        customOllamaServer: config.custom,
      });
    });

    return () => {
      active = false;
    };
  }, [reset, settingOpen]);

  const handleChange = (isOpen: boolean) => {
    if (isOpen) return;

    dispatch(hideSetting());
    reset(defaultValues);
  };

  const onSubmit = async (values: FormValues) => {
    const config: OllamaServerConfig = {
      custom: values.customOllamaServer,
      url: values.ollamaServerUrl,
    };

    await setOllamaServerConfig(config);
    toast.success('Settings saved.', {
      description: 'Reloading the app to apply the Ollama server configuration.',
    });
    dispatch(hideSetting());
    window.setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <Dialog open={settingOpen} onOpenChange={handleChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your theme and the Ollama server used by the app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <FieldLabel>Theme</FieldLabel>
                  <FieldDescription>Choose the appearance used across the app.</FieldDescription>
                </div>
                <ModeToggle />
              </div>
            </Field>

            <Field data-invalid={Boolean(errors.ollamaServerUrl)}>
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="switchCustomServer">Custom Ollama server</FieldLabel>
                  <FieldDescription>
                    Use a non-default Ollama endpoint instead of the local server.
                  </FieldDescription>
                </div>
                <Switch
                  id="switchCustomServer"
                  checked={customServerEnabled}
                  onCheckedChange={(checked) =>
                    setValue('customOllamaServer', checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <FieldLabel
                    htmlFor="ollama-server-url"
                    data-invalid={Boolean(errors.ollamaServerUrl)}
                  >
                    Server URL
                  </FieldLabel>
                  <Input
                    id="ollama-server-url"
                    aria-invalid={Boolean(errors.ollamaServerUrl)}
                    disabled={!customServerEnabled}
                    placeholder={DEFAULT_OLLAMA_SERVER_CONFIG.url}
                    {...register('ollamaServerUrl')}
                  />
                  <FieldDescription>
                    Example: {DEFAULT_OLLAMA_SERVER_CONFIG.url}
                  </FieldDescription>
                  <FieldError errors={[errors.ollamaServerUrl]} />
                </div>
                <CheckButton disabled={!customServerEnabled} url={serverUrl ?? ''} />
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
