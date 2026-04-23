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
    
    // CRITICAL: Always read from Redux store, never use local state
    const addresses = useSelector((state) => state.address?.addresses) || [];
    const loading = useSelector((state) => state.address?.loading) || false;
    const error = useSelector((state) => state.address?.error) || null;
    const loadingMap = useSelector((state) => state.address?.loadingMap) || {};

    const handleFetch = useCallback(() => {
        return dispatch(fetchAddresses());
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
        console.log("📌 [useAddress] handleSetDefault dispatching for:", id);
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
