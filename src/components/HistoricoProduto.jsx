import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";

const HistoricoProduto = ({ visible, onHide, produtoId }) => {
  const [produto, setProduto] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (produtoId) {
      carregarHistorico();
    }
  }, [produtoId]);

  const carregarHistorico = () => {
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    const movimentacoes = JSON.parse(
      localStorage.getItem("movimentacoes") || "[]",
    );

    const produtoEncontrado = produtos.find((p) => p.id === produtoId);
    setProduto(produtoEncontrado);

    const historicoFiltrado = movimentacoes
      .filter((m) => m.produtoId === produtoId)
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    setHistorico(historicoFiltrado);
  };

  const tipoBodyTemplate = (rowData) => {
    const severity = rowData.tipo === "ENTRADA" ? "success" : "danger";
    return <Tag value={rowData.tipo} severity={severity} />;
  };

  const dataBodyTemplate = (rowData) => {
    return new Date(rowData.data).toLocaleString("pt-BR");
  };

  const customizedMarker = (item) => {
    return (
      <span
        style={{
          backgroundColor: item.tipo === "ENTRADA" ? "#22c55e" : "#ef4444",
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <i
          className={
            item.tipo === "ENTRADA" ? "pi pi-arrow-down" : "pi pi-arrow-up"
          }
        ></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <div
        style={{
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <strong>{item.tipo}</strong>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            {new Date(item.data).toLocaleString("pt-BR")}
          </span>
        </div>
        <div>
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: item.tipo === "ENTRADA" ? "#22c55e" : "#ef4444",
            }}
          >
            {item.tipo === "ENTRADA" ? "+" : "-"} {item.quantidade} unidades
          </span>
        </div>
        {item.observacao && (
          <div
            style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}
          >
            📝 {item.observacao}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "800px" }}
      header={`📋 Histórico de Movimentações - ${produto?.nome || ""}`}
      modal
      onHide={onHide}
    >
      {produto && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            background: "#f0f9ff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <strong>Código:</strong> {produto.codigo || "-"}
            </div>
            <div>
              <strong>Categoria:</strong> {produto.categoria}
            </div>
            <div>
              <strong>Estoque Atual:</strong>
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontWeight: "bold",
                  color:
                    produto.estoqueAtual <= produto.estoqueMin
                      ? "#ef4444"
                      : "#22c55e",
                }}
              >
                {produto.estoqueAtual}
              </span>
            </div>
          </div>
        </div>
      )}

      {historico.length > 0 ? (
        <>
          <h3 style={{ marginBottom: "1rem" }}>Timeline de Movimentações</h3>
          <Timeline
            value={historico}
            content={customizedContent}
            marker={customizedMarker}
          />

          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            Tabela Detalhada
          </h3>
          <DataTable value={historico} paginator rows={5}>
            <Column field="tipo" header="Tipo" body={tipoBodyTemplate} />
            <Column field="quantidade" header="Quantidade" />
            <Column field="data" header="Data/Hora" body={dataBodyTemplate} />
            <Column field="observacao" header="Observação" />
          </DataTable>

          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <strong>Resumo:</strong>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              <div>
                Total de Movimentações: <strong>{historico.length}</strong>
              </div>
              <div style={{ color: "#22c55e" }}>
                Entradas:{" "}
                <strong>
                  {historico.filter((h) => h.tipo === "ENTRADA").length}
                </strong>
              </div>
              <div style={{ color: "#ef4444" }}>
                Saídas:{" "}
                <strong>
                  {historico.filter((h) => h.tipo === "SAIDA").length}
                </strong>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          <i
            className="pi pi-inbox"
            style={{ fontSize: "3rem", marginBottom: "1rem" }}
          ></i>
          <p>Nenhuma movimentação registrada para este produto</p>
        </div>
      )}
    </Dialog>
  );
};

export default HistoricoProduto;
