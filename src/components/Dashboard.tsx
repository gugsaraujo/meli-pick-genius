// src/components/Dashboard.tsx
import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
}

interface Order {
  id: string;
  order_items: OrderItem[];
  shipping?: { receiver_address?: { address_line?: string } };
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('ml_access_token');

  const buscarPedidos = async () => {
    if (!token) {
      alert('Faça login no Mercado Livre!');
      window.location.href = '/';
      return;
    }
    setLoading(true);
    try {
      const userRes = await axios.get('https://api.mercadolibre.com/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sellerId = userRes.data.id;

      const ordersRes = await axios.get(`https://api.mercadolibre.com/orders/search?seller=${sellerId}&order.status=paid`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPedidos(ordersRes.data.results);
    } catch (error) {
      console.error('Erro:', error.response?.data);
      alert('Erro ao buscar pedidos.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Picking List</h1>
      <Button onClick={buscarPedidos} disabled={loading} className="bg-blue-600 hover:bg-blue-700 mb-4">
        {loading ? 'Carregando...' : 'Sincronizar Pedidos'}
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Pedido ID</TableHead>
            <TableHead className="text-white">Produto</TableHead>
            <TableHead className="text-white">Quantidade</TableHead>
            <TableHead className="text-white">Endereço</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidos.map(order =>
            order.order_items.map(item => (
              <TableRow key={`${order.id}-${item.id}`}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{order.shipping?.receiver_address?.address_line || 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
