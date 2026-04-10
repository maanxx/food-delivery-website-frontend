import { useContext } from "react";

const { LoadingContext } = require("@contexts/loading");

const useLoading = () => useContext(LoadingContext);

export default useLoading;
