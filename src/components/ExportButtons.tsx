import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  storage_location: string;
  order_id: string;
}

interface ExportButtonsProps {
  items: OrderItem[];
  orders: any[];
}

export function ExportButtons({ items, orders }: ExportButtonsProps) {
  const getOrderInfo = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  const exportToPDF = () => {
    if (items.length === 0) {
      toast.error("Nenhum item para exportar");
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Picking List - Lista de Separação", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);
    
    // Tabela
    const tableData = items.map(item => {
      const order = getOrderInfo(item.order_id);
      return [
        item.product_name,
        item.sku,
        item.quantity.toString(),
        item.storage_location,
        order?.ml_order_id || "N/A",
        order?.buyer_name || "N/A"
      ];
    });

    autoTable(doc, {
      head: [["Produto", "SKU", "Qtd", "Local", "Pedido ID", "Cliente"]],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save(`picking-list-${Date.now()}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportToCSV = () => {
    if (items.length === 0) {
      toast.error("Nenhum item para exportar");
      return;
    }

    // Cabeçalho
    const headers = ["Produto", "SKU", "Quantidade", "Local no Estoque", "Pedido ID", "Cliente"];
    
    // Dados
    const rows = items.map(item => {
      const order = getOrderInfo(item.order_id);
      return [
        item.product_name,
        item.sku,
        item.quantity,
        item.storage_location,
        order?.ml_order_id || "N/A",
        order?.buyer_name || "N/A"
      ];
    });

    // Construir CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `picking-list-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exportado com sucesso!");
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToPDF} variant="outline" size="sm">
        <FileDown className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
      <Button onClick={exportToCSV} variant="outline" size="sm">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
    </div>
  );
}
