import { makeLoadableSlice } from "./makeLoadableSlice";
import { type Slice } from '@reduxjs/toolkit'

const { slice, selector } = makeLoadableSlice("chains", CONFIG_SERVICE_CHAINS);

export const chainsSlice = slice;
export const selectChains = selector;
const useUpdateStore = (
  slice: Slice,
  useLoadHook: () => AsyncResult<unknown>
): void => {
  const dispatch = useAppDispatch();
  const [data, error, loading] = useLoadHook();
  const setAction = slice.actions.set;

  useEffect(() => {
    dispatch(
      setAction({
        data,
        error: data ? undefined : error?.message,
        loading: loading && !data,
      })
    );
  }, [dispatch, setAction, data, error, loading]);
};

const useLoadableStores = () => {
  useUpdateStore(chainsSlice, useLoadChains);
};
