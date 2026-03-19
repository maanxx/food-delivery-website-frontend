import * as React from "react";
import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import { styled } from "@mui/system";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { updateCartItemQuantity } from "@services/cartService";

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
    return (
        <BaseNumberInput
            slots={{
                root: StyledInputRoot,
                input: StyledInput,
                incrementButton: StyledButton,
                decrementButton: StyledButton,
            }}
            slotProps={{
                incrementButton: {
                    children: <AddIcon fontSize="small" />,
                    className: "increment",
                },
                decrementButton: {
                    children: <RemoveIcon fontSize="small" />,
                    className: "decrement",
                },
            }}
            {...props}
            ref={ref}
        />
    );
});

export default function QuantityInput({ min, max, currentValue, cartItemId, loadCartItems, setOpenModal }) {
    const [value, setValue] = React.useState(currentValue);

    const handleChange = async (event, newValue) => {
        if (newValue !== null && newValue >= min && newValue <= max) {
            setValue(newValue);
            await updateCartItemQuantity(cartItemId, newValue);
            await loadCartItems();
            if (newValue === 0) {
                setOpenModal(true);
            }
        }
    };

    return <NumberInput aria-label="Quantity Input" min={min} max={max} value={value} onChange={handleChange} />;
}

const orange = {
    100: "#ffe3d1",
    200: "#ffc4a3",
    300: "#ff9c6d",
    400: "#ff7f4d",
    500: "#ff914d",
    600: "#e58242",
    700: "#cc7437",
    800: "#b3662d",
};

const grey = {
    50: "#F3F6F9",
    100: "#E5EAF2",
    200: "#DAE2ED",
    300: "#C7D0DD",
    400: "#B0B8C4",
    500: "#9DA8B7",
    600: "#6B7A90",
    700: "#434D5B",
    800: "#303740",
    900: "#1C2025",
};

const StyledInputRoot = styled("div")(
    ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[500]};
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`,
);

const StyledInput = styled("input")(
    ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0, 0.5)" : "rgba(0,0,0, 0.05)"};
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 4rem;
  text-align: center;

  &:hover {
    border-color: ${orange[400]};
  }

  &:focus {
    border-color: ${orange[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === "dark" ? orange[700] : orange[200]};
  }

  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledButton = styled("button")(
    ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
  background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === "dark" ? orange[700] : orange[500]};
    border-color: ${theme.palette.mode === "dark" ? orange[500] : orange[400]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`,
);
