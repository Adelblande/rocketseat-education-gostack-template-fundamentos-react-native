import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cart = await AsyncStorage.getItem('@goMarketPlace:cart');
      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIncremented = products.map(product => {
        const { title, image_url, price, quantity } = product;
        return {
          id,
          title,
          image_url,
          price,
          quantity: product.id === id ? quantity + 1 : quantity,
        };
      });

      await AsyncStorage.setItem(
        '@goMarketPlace:cart',
        JSON.stringify(productIncremented),
      );
      setProducts([...productIncremented]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => {
        return product.id === id;
      });

      if (products[productIndex].quantity === 1) {
        const productDecremented = products.filter(
          product => product.id !== id,
        );
        await AsyncStorage.setItem(
          '@goMarketPlace:cart',
          JSON.stringify(productDecremented),
        );
        setProducts(productDecremented);
      } else {
        const productDecremented = products.map(product => {
          const { title, image_url, price, quantity } = product;
          return {
            id,
            title,
            image_url,
            price,
            quantity: product.id === id ? quantity - 1 : quantity,
          };
        });
        await AsyncStorage.setItem(
          '@goMarketPlace:cart',
          JSON.stringify(productDecremented),
        );
        setProducts(productDecremented);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const { id, title, image_url, price } = product;
      const newItem = {
        id,
        title,
        image_url,
        price,
        quantity: 1,
      };

      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => {
        return item.id === product.id;
      });

      if (productIndex === -1) {
        await AsyncStorage.setItem(
          '@goMarketPlace:cart',
          JSON.stringify([...products, newItem]),
        );
        setProducts([...products, newItem]);
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
