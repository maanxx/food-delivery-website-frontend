import React from "react";
import { Button, Input, Select } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import styles from "./AddressForm.module.css";

// UPDATED SCHEMA
const schema = yup.object().shape({
  label: yup.string().required("Vui lòng chọn nhãn"),
  street: yup.string().required("Vui lòng nhập địa chỉ"),
  ward: yup.string().required("Vui lòng nhập phường/xã"),
  city: yup.string().required("Vui lòng nhập thành phố"),
});

const { Option } = Select;

// UPDATED
const AddressForm = ({
  visible,
  onCancel,
  onSubmit,
  initialData = {},
  loading,
}) => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      label: "",
      street: "",
      ward: "",
      city: "",
      ...initialData,
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        label: "",
        street: "",
        ward: "",
        city: "",
        ...initialData,
      });
    }
  }, [visible, initialData, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Phân loại địa chỉ</label>
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                className={styles.input}
                placeholder="Chọn nhãn (Nhà riêng, Công ty...)"
              >
                <Option value="Home">Nhà riêng</Option>
                <Option value="Work">Công ty</Option>
                <Option value="Other">Khác</Option>
              </Select>
            )}
          />
          {errors.label && (
            <p className={styles.errorMessage}>{errors.label.message}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Số nhà, tên đường *</label>
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ví dụ: 123 Lê Lợi"
                className={`${styles.input} ${
                  errors.street ? styles.inputError : ""
                }`}
              />
            )}
          />
          {errors.street && (
            <p className={styles.errorMessage}>{errors.street.message}</p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phường / Xã *</label>
            <Controller
              name="ward"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nhập phường/xã"
                  className={`${styles.input} ${
                    errors.ward ? styles.inputError : ""
                  }`}
                />
              )}
            />
            {errors.ward && (
              <p className={styles.errorMessage}>{errors.ward.message}</p>
            )}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Thành phố *</label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  className={`${styles.input} ${
                    errors.city ? styles.inputError : ""
                  }`}
                />
              )}
            />
            {errors.city && (
              <p className={styles.errorMessage}>{errors.city.message}</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className={styles.submitBtn}
          >
            {initialData?.address_id ? "Cập nhật" : "Lưu địa chỉ"}
          </Button>
          <Button 
            onClick={onCancel} 
            className={styles.cancelBtn}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
