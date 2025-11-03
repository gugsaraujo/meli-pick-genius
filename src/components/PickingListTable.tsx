import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  storage_location: string;
  order_id: string;
}

interface PickingListTableProps {
  items: OrderItem[];
  orders: any[];
}

export function PickingListTable({ items, orders }: PickingListTableProps) {
  const getOrderInfo = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-center">Quantidade</TableHead>
            <TableHead>Local no Estoque</TableHead>
            <TableHead>Pedido ID</TableHead>
            <TableHead>Cliente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum item para separar. Clique em "Buscar Pedidos" para carregar.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const order = getOrderInfo(item.order_id);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.sku}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{item.quantity}x</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-primary">{item.storage_location}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {order?.ml_order_id || "N/A"}
                  </TableCell>
                  <TableCell>{order?.buyer_name || "N/A"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
