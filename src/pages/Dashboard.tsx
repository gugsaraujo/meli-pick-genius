import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PickingListTable } from "@/components/PickingListTable";
import { ExportButtons } from "@/components/ExportButtons";
import { toast } from "sonner";
import { RefreshCw, Package } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dados mockados da API do Mercado Livre
  const mockMLOrders = [
    {
      ml_order_id: "ML-2024-001",
      buyer_name: "João Silva",
      buyer_address: "Rua das Flores, 123 - São Paulo, SP",
      total_amount: 299.90,
      items: [
        { product_name: "Tênis Esportivo Nike", sku: "NIKE-001", quantity: 2, storage_location: "Corredor A - Prateleira 3" },
        { product_name: "Meia Esportiva", sku: "SOCK-001", quantity: 3, storage_location: "Corredor B - Prateleira 1" },
      ]
    },
    {
      ml_order_id: "ML-2024-002",
      buyer_name: "Maria Santos",
      buyer_address: "Av. Paulista, 1000 - São Paulo, SP",
      total_amount: 450.00,
      items: [
        { product_name: "Camisa Polo Lacoste", sku: "LAC-001", quantity: 1, storage_location: "Corredor C - Prateleira 2" },
        { product_name: "Calça Jeans Levi's", sku: "LEVIS-001", quantity: 2, storage_location: "Corredor A - Prateleira 5" },
      ]
    },
    {
      ml_order_id: "ML-2024-003",
      buyer_name: "Pedro Costa",
      buyer_address: "Rua Augusta, 500 - São Paulo, SP",
      total_amount: 199.90,
      items: [
        { product_name: "Boné Adidas", sku: "ADI-CAP-001", quantity: 1, storage_location: "Corredor D - Prateleira 1" },
        { product_name: "Óculos de Sol Ray-Ban", sku: "RAY-001", quantity: 1, storage_location: "Corredor B - Prateleira 4" },
      ]
    },
    {
      ml_order_id: "ML-2024-004",
      buyer_name: "Ana Oliveira",
      buyer_address: "Rua Oscar Freire, 789 - São Paulo, SP",
      total_amount: 850.00,
      items: [
        { product_name: "Jaqueta de Couro", sku: "JACKET-001", quantity: 1, storage_location: "Corredor E - Prateleira 2" },
        { product_name: "Bota Masculina", sku: "BOOT-001", quantity: 1, storage_location: "Corredor A - Prateleira 7" },
      ]
    },
    {
      ml_order_id: "ML-2024-005",
      buyer_name: "Carlos Mendes",
      buyer_address: "Av. Faria Lima, 2000 - São Paulo, SP",
      total_amount: 320.00,
      items: [
        { product_name: "Relógio Casio", sku: "CASIO-001", quantity: 1, storage_location: "Corredor F - Prateleira 3" },
        { product_name: "Carteira de Couro", sku: "WALLET-001", quantity: 2, storage_location: "Corredor C - Prateleira 1" },
      ]
    }
  ];

  const fetchOrders = async () => {
    const { data: existingOrders } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (existingOrders && existingOrders.length > 0) {
      setOrders(existingOrders);
      return existingOrders;
    }
    return [];
  };

  const fetchItems = async () => {
    const { data: allItems } = await supabase
      .from("order_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (allItems) {
      setItems(allItems);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchItems();
  }, []);

  const handleFetchOrders = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Simula integração com API do Mercado Livre
      // Em produção, aqui seria: const response = await fetch('https://api.mercadolibre.com/orders/...')
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência da API

      // Insere os pedidos mockados no banco
      for (const mockOrder of mockMLOrders) {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            ml_order_id: mockOrder.ml_order_id,
            buyer_name: mockOrder.buyer_name,
            buyer_address: mockOrder.buyer_address,
            total_amount: mockOrder.total_amount,
            status: "pending"
          })
          .select()
          .single();

        if (orderError) {
          console.error("Erro ao inserir pedido:", orderError);
          continue;
        }

        // Insere os itens do pedido
        for (const item of mockOrder.items) {
          const { error: itemError } = await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              product_name: item.product_name,
              sku: item.sku,
              quantity: item.quantity,
              storage_location: item.storage_location
            });

          if (itemError) {
            console.error("Erro ao inserir item:", itemError);
          }
        }
      }

      await fetchOrders();
      await fetchItems();
      
      toast.success(`${mockMLOrders.length} pedidos carregados com sucesso!`);
    } catch (error: any) {
      toast.error("Erro ao buscar pedidos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie seus pedidos e picking list
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleFetchOrders} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Buscando..." : "Buscar Pedidos"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Simula integração com API do Mercado Livre</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              pedidos carregados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens para Separar</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              unidades no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Únicos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">
              SKUs diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Picking List</CardTitle>
              <CardDescription>
                Lista organizada de itens para separação no estoque
              </CardDescription>
            </div>
            <ExportButtons items={items} orders={orders} />
          </div>
        </CardHeader>
        <CardContent>
          <PickingListTable items={items} orders={orders} />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">💡 Como funciona a integração</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Atualmente usando dados mockados para demonstração. Para integrar com a API real do Mercado Livre:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Obtenha suas credenciais de API no Mercado Livre Developers</li>
            <li>Configure o access token e refresh token</li>
            <li>Substitua a função mockada por chamadas reais à API</li>
            <li>Endpoint: <code className="bg-background px-1 py-0.5 rounded">GET /orders/search</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
