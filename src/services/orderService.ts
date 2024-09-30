import { generateClient } from "aws-amplify/data";
import type { Schema } from "amplify/data/resource";

const client = generateClient<Schema>();

export const createOrder = async (orderData: any) => {
  try {
    const { data, errors } = await client.models.Order.create({
      ...orderData,
      created_at: Math.floor(new Date(orderData.created_at).getTime() / 1000),
      updated_at: Math.floor(new Date(orderData.updated_at).getTime() / 1000)
    });

    if (errors) {
      console.error("Errors creating order:", errors);
      throw new Error('Failed to place order. Please try again.');
    }
    return data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw new Error('An error occurred while placing the order. Please try again.');
  }
};

export const fetchOrders = async () => {
  try {
    const { data, errors } = await client.models.Order.list();

    if (errors) {
      console.error("Errors fetching orders:", errors);
      throw new Error('Failed to fetch orders. Please try again.');
    }
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('An error occurred while fetching the orders. Please try again.');
  }
};