import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (artwork) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === artwork.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === artwork.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...artwork, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (artworkId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== artworkId));
    };

    const updateQuantity = (artworkId, delta) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === artworkId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
