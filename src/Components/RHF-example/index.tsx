import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, CircularProgress, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AppSelectDay } from "components/forms/AppSelectDay";
import AppTextField from "components/forms/AppTextField";
import SwitchContractDao from "components/forms/SwitchContract/SwitchContractDao";
import SwitchContractTarget from "components/forms/SwitchContract/SwitchContractTarget";
import { ethers } from "ethers";
import { useAppSelector } from "hooks/hooks";
import { isEmpty, values } from "lodash";
import { MultiWithFormProps } from "models";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { MultiAction__factory } from "views/DAO/daoConfigs/type";
import {
  schemaAmount,
  schemaContractDao,
  schemaContractTarget,
  schemaDeadline,
  schemaNote,
} from "views/DAO/daoConfigs/validation";
import { useSubmitTx } from "views/DAO/hooks/useSubmitTx";
import * as yup from "yup";

type FormValues = {
  dao: string;
  contractTarget: string;
  tokenERC20: string;

  note: string;
  deadline: number;
  store: {
    address: string;
    amount: number | string;
  }[];
};

const schema = yup.object().shape({
  contractTarget: schemaContractTarget,
  tokenERC20: yup
    .string()
    .required("Field is required")
    .test("tokenERC20", "Field is required", (value: any) => +value > 0),
  note: schemaNote,
  deadline: schemaDeadline,
  dao: schemaContractDao,
  store: yup.array().of(
    yup.object().shape({
      address: yup
        .string()
        .required("Address is required")
        .test("address", "Invalid address", (value: any) => {
          return ethers.utils.isAddress(value) ? true : false;
        }),
      amount: schemaAmount,
    })
  ),
});

const AppMultiMint = ({
  functionFragment,
  methodSignature,
  type,
}: MultiWithFormProps) => {
  const [dataTable, setDataTable] = useState<any>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      dao: "",
      contractTarget: "",
      tokenERC20: "",
      note: "",
      deadline: 0,
      store: [{ address: "", amount: "" }],
    },
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    name: "store",
    control,
  });

  const onSubmit = (dataForm: FormValues) => {};

  const { contractListByName } = useAppSelector((state) => state.bamdao);

  const { isSubmitting, onAsyncSubmit } = useSubmitTx(() => reset());

  return (
    <>
      <Box
        p={3}
        sx={{
          textAlign: "center",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} textAlign="left">
              <Box>
           

                <Box my={2}>
                  <TextField
                    label={label}
                    style={{
                      width: "100%",
                    }}
                    placeholder={placeholder}
                    {...register(name, {
                      required: true,
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      style: {
                        height: "2.5rem",
                        width: "100%",
                        color: "#fff",
                        borderRadius: 10,
                        padding: 10,
                      },
                    }}
                    {...rest}
                  />
                  <Typography
                    color={"error"}
                    align="left"
                    fontSize={12}
                    sx={{
                      height: "1rem",
                    }}
                  >
                    {err && <span>{err}</span>}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8} textAlign="left">
              <Box>
                {fields.map((field, index) => {
                  return (
                    <Box key={field.id}>
                      <Grid container spacing={2}>
                        <Grid item xs={5}>
                          <AppTextField
                            label="Address"
                            register={register}
                            name={`store.${index}.address`}
                            placeholder="Enter your address"
                            onChange={(e) => {
                              setValue(
                                `store.${index}.address`,
                                e.target.value
                              );
                              handleChange(index, "address", e.target.value);
                            }}
                            err={
                              errors.store && (
                                <span>
                                  {errors.store[index]?.address?.message}
                                </span>
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <AppTextField
                            label="Amount"
                            register={register}
                            name={`store.${index}.amount`}
                            placeholder="Amount"
                            onChange={(e) => {
                              setValue(`store.${index}.amount`, e.target.value);
                              handleChange(index, "amount", e.target.value);
                            }}
                            err={
                              errors.store && (
                                <span>
                                  {errors.store[index]?.amount?.message}
                                </span>
                              )
                            }
                          />
                        </Grid>

                        {index > 0 && (
                          <Grid item xs={2}>
                            <Box
                              sx={{
                                height: "1rem",
                              }}
                            ></Box>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => remove(index)}
                            >
                              DELETE
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() =>
                    append({
                      address: "",
                      amount: "",
                    })
                  }
                >
                  APPEND
                </Button>
              </Box>
            </Grid>
          </Grid>

          {!isEmpty(dataTable) && (
            <Box p={3}>
              <div style={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={values(dataTable)}
                  columns={[
                    { field: "id", headerName: "STT", width: 200 },
                    { field: "address", headerName: "Address ", width: 500 },
                    { field: "amount", headerName: "Amount  ", width: 500 },
                  ]}
                />
              </div>
            </Box>
          )}

          <Box p={3}>
            <Button
              variant="outlined"
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={14} />}
            >
              {type}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};
export default AppMultiMint;
