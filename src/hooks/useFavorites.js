import { useDispatch, useSelector } from "react-redux";
import {
    addUserFavorite,
    removeUserFavorite,
    selectFavoriteActionLoading,
    selectIsFavorite,
} from "@features/user/userSlice";

const useFavorites = (dishId = null) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const isFavorite = useSelector(
        dishId ? selectIsFavorite(dishId) : () => false,
    );
    const isMutating = useSelector(
        dishId ? selectFavoriteActionLoading(dishId) : () => false,
    );

    const toggleFavorite = async () => {
        if (!dishId || !isAuthenticated || isMutating) {
            return;
        }

        if (isFavorite) {
            await dispatch(removeUserFavorite(dishId));
            return;
        }

        await dispatch(addUserFavorite(dishId));
    };

    return {
        isAuthenticated,
        isFavorite,
        isMutating,
        toggleFavorite,
    };
};

export default useFavorites;
