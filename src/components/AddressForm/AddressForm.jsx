import React from "react";
import { Button, Input, Select, Modal } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
const schema = yup.object().shape({
  label: yup.string().required("Label is required"),
  street: yup.string().required("Street is required"),
  city: yup.string().required("City is required"),
  state: yup.string(),
  zip_code: yup.string(),
  country: yup.string().required("Country is required"),
});

const { Option } = Select;

const AddressForm = ({
  visible,
  onCancel,
  onSubmit,
  initialData = {},
  loading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: "Vietnam",
      ...initialData,
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset(initialData);
    }
  }, [visible, initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal
      title={initialData?.address_id ? "Edit Address" : "Add New Address"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <Input
            {...register("label")}
            placeholder="Home, Work, etc."
            className={errors.label ? "border-red-500" : ""}
          />
          {errors.label && (
            <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Street Address *
          </label>
          <Input
            {...register("street")}
            placeholder="123 Main St"
            className={errors.street ? "border-red-500" : ""}
          />
          {errors.street && (
            <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <Input
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Input {...register("state")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Zip Code</label>
            <Input {...register("zip_code")} />
            {errors.zip_code && (
              <p className="text-red-500 text-xs mt-1">
                {errors.zip_code.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select {...field} style={{ width: "100%" }}>
                  <Option value="Vietnam">Vietnam</Option>
                  <Option value="USA">USA</Option>
                  <Option value="Other">Other</Option>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="primary" htmlType="submit" loading={loading} block>
            {initialData?.address_id ? "Update Address" : "Add Address"}
          </Button>
          <Button onClick={onCancel} block>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressForm;
