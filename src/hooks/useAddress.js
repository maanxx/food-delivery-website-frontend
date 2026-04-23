// NEW
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { 
    fetchAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
} from "../features/address/addressSlice";

export const useAddress = () => {
    const dispatch = useDispatch();
    const { addresses, loading, error, loadingMap } = useSelector((state) => state.address);

    const handleFetch = useCallback(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    const handleAdd = useCallback((data) => {
        return dispatch(addAddress(data));
    }, [dispatch]);

    const handleUpdate = useCallback((id, data) => {
        if (!id || id === "undefined") {
            console.error("❌ [useAddress] handleUpdate called with invalid ID:", id);
            return;
        }
        return dispatch(updateAddress({ id, data }));
    }, [dispatch]);

    const handleDelete = useCallback((id) => {
        if (!id || id === "undefined") {
            console.error("❌ [useAddress] handleDelete called with invalid ID:", id);
            return;
        }
        if (loadingMap[id]?.deleting) return;
        return dispatch(deleteAddress(id));
    }, [dispatch, loadingMap]);

    const handleSetDefault = useCallback((id) => {
        if (!id || id === "undefined") {
            console.error("❌ [useAddress] handleSetDefault called with invalid ID:", id);
            return;
        }
        if (loadingMap[id]?.settingDefault) return;
        return dispatch(setDefaultAddress(id));
    }, [dispatch, loadingMap]);

    return {
        addresses,
        loading,
        error,
        loadingMap,
        fetchAddresses: handleFetch,
        addAddress: handleAdd,
        updateAddress: handleUpdate,
        deleteAddress: handleDelete,
        setDefaultAddress: handleSetDefault,
    };
};
