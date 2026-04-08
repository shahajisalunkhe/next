import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);

    const getLocalCart = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('vionara_cart');
            return stored ? JSON.parse(stored) : { items: [] };
        }
        return { items: [] };
    };

    const saveLocalCart = (cartData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('vionara_cart', JSON.stringify(cartData));
        }
        setCart(cartData);
    };

    const addItem = useCallback((product, quantity = 1, size = '') => {
        const currentCart = getLocalCart();
        const existing = currentCart.items.find(
            (item) => item.product._id === product._id && item.size === size
        );
        if (existing) {
            existing.quantity += quantity;
        } else {
            currentCart.items.push({ product, quantity, size, _id: Date.now().toString() });
        }
        saveLocalCart(currentCart);
    }, []);

    const removeItem = useCallback((itemId) => {
        const currentCart = getLocalCart();
        currentCart.items = currentCart.items.filter((item) => item._id !== itemId);
        saveLocalCart(currentCart);
    }, []);

    const updateQuantity = useCallback((itemId, quantity) => {
        const currentCart = getLocalCart();
        const item = currentCart.items.find((i) => i._id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            saveLocalCart(currentCart);
        }
    }, []);

    const clearCartItems = useCallback(() => {
        saveLocalCart({ items: [] });
    }, []);

    const getCartTotal = () => {
        const currentCart = getLocalCart();
        return currentCart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const getCartCount = () => {
        const currentCart = getLocalCart();
        return currentCart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const refreshCart = useCallback(() => {
        setCart(getLocalCart());
    }, []);

    return (
        <CartContext.Provider value={{
            cart: getLocalCart(),
            addItem,
            removeItem,
            updateQuantity,
            clearCartItems,
            getCartTotal,
            getCartCount,
            isCartOpen,
            setIsCartOpen,
            refreshCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
