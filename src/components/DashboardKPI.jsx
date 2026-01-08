import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

const DashboardKPI = () => {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [kpis, setKpis] = useState({
    totalProdutos: 0,
    valorTotal: 0,
    produtosBaixoEstoque: 0,
    movimentacoesHoje: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const produtosData = JSON.parse(localStorage.getItem("produtos") || "[]");
    const movimentacoesData = JSON.parse(
      localStorage.getItem("movimentacoes") || "[]",
    );

    setProdutos(produtosData);
    setMovimentacoes(movimentacoesData);

    // Calcular KPIs
    const hoje = new Date().toDateString();
    const movHoje = movimentacoesData.filter(
      (m) => new Date(m.data).toDateString() === hoje,
    ).length;

    const valorTotal = produtosData.reduce(
      (acc, p) => acc + p.precoCompra * p.estoqueAtual,
      0,
    );

    const baixoEstoque = produtosData.filter(
      (p) => p.estoqueAtual <= p.estoqueMin,
    ).length;

    setKpis({
      totalProdutos: produtosData.length,
      valorTotal: valorTotal,
      produtosBaixoEstoque: baixoEstoque,
      movimentacoesHoje: movHoje,
    });
  };

  // Dados para gráfico de categorias
  const getChartCategorias = () => {
    const categorias = {};
    produtos.forEach((p) => {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    });

    return {
      labels: Object.keys(categorias),
      datasets: [
        {
          data: Object.values(categorias),
          backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ],
        },
      ],
    };
  };

  // Dados para gráfico de movimentações
  const getChartMovimentacoes = () => {
    const ultimos7Dias = [];
    const entradas = [];
    const saidas = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      ultimos7Dias.push(dataStr);

      const movDia = movimentacoes.filter(
        (m) => new Date(m.data).toDateString() === data.toDateString(),
      );

      entradas.push(movDia.filter((m) => m.tipo === "ENTRADA").length);
      saidas.push(movDia.filter((m) => m.tipo === "SAIDA").length);
    }

    return {
      labels: ultimos7Dias,
      datasets: [
        {
          label: "Entradas",
          data: entradas,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          tension: 0.4,
        },
        {
          label: "Saídas",
          data: saidas,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.4,
        },
      ],
    };
  };

  const produtosBaixoEstoque = produtos.filter(
    (p) => p.estoqueAtual <= p.estoqueMin,
  );

  const estoqueBodyTemplate = (rowData) => {
    return (
      <Tag
        value={`${rowData.estoqueAtual} / ${rowData.estoqueMin}`}
        severity="danger"
      />
    );
  };

  return (
    <div>
      {/* KPIs Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Total de Produtos
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {kpis.totalProdutos}
              </div>
            </div>
            <i
              className="pi pi-box"
              style={{ fontSize: "3rem", opacity: 0.3 }}
            ></i>
          </div>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Valor Total em Estoque
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                R$ {kpis.valorTotal.toFixed(2)}
              </div>
            </div>
            <i
              className="pi pi-dollar"
              style={{ fontSize: "3rem", opacity: 0.3 }}
            ></i>
          </div>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Produtos Baixo Estoque
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {kpis.produtosBaixoEstoque}
              </div>
            </div>
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: "3rem", opacity: 0.3 }}
            ></i>
          </div>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Movimentações Hoje
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {kpis.movimentacoesHoje}
              </div>
            </div>
            <i
              className="pi pi-calendar"
              style={{ fontSize: "3rem", opacity: 0.3 }}
            ></i>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card title="📊 Produtos por Categoria">
          <Chart type="doughnut" data={getChartCategorias()} />
        </Card>

        <Card title="📈 Movimentações (Últimos 7 dias)">
          <Chart type="line" data={getChartMovimentacoes()} />
        </Card>
      </div>

      {/* Alertas */}
      {produtosBaixoEstoque.length > 0 && (
        <Card
          title="⚠️ Produtos com Estoque Baixo"
          style={{ marginBottom: "1rem" }}
        >
          <DataTable value={produtosBaixoEstoque} paginator rows={5}>
            <Column field="nome" header="Produto" />
            <Column field="categoria" header="Categoria" />
            <Column
              header="Estoque Atual / Mínimo"
              body={estoqueBodyTemplate}
            />
            <Column field="localizacao" header="Localização" />
          </DataTable>
        </Card>
      )}
    </div>
  );
};

export default DashboardKPI;
