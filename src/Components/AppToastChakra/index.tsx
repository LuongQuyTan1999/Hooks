import { Alert, AlertDescription, AlertTitle } from "@chakra-ui/alert";
import { Box } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useToast, UseToastOptions } from "@chakra-ui/toast";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface IToastAsyncProps {
  title?: ReactNode;
  description?: ReactNode;
  id?: string | number;
}

export const AppToastAsync = ({
  title = "Loading...",
  description,
  id,
}: IToastAsyncProps) => (
  <Alert
    status="info"
    variant="left-accent"
    id={id?.toString()}
    alignItems="start"
    borderRadius="md"
    boxShadow="lg"
    paddingEnd={8}
    textAlign="start"
    width="auto"
  >
    <Spinner marginRight="4" />
    <Box flex="1">
      <AlertTitle>{title}</AlertTitle>
      {description && (
        <AlertDescription display="block">{description}</AlertDescription>
      )}
    </Box>
  </Alert>
);

export function useToastAsync(
  loading?: boolean,
  toastOptions?: UseToastOptions
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const toast = useToast();
  const toastRef = useRef<string | number | undefined>();
  const [isLoading, setLoading] = useState<boolean>(loading ?? false);

  useEffect(() => {
    if (isLoading) {
      toastRef.current = toast({
        render: () => <AppToastAsync {...toastOptions} />,
        ...toastOptions,
      });
    } else if (toastRef.current) {
      toast.close(toastRef.current);
    }
  }, [isLoading, toast, toastOptions]);

  return [isLoading, setLoading];
}
