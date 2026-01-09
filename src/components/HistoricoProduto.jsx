import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { Button } from "primereact/button";

const HistoricoProduto = ({ visible, onHide, produto }) => {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (visible && produto && produto.id) {
      carregarHistorico();
    }
  }, [visible, produto]);

  const carregarHistorico = () => {
    console.log("🔍 Carregando histórico para produto:", produto);

    const movimentacoes = JSON.parse(
      localStorage.getItem("movimentacoes") || "[]",
    );

    console.log("📦 Todas as movimentações:", movimentacoes);

    const historicoFiltrado = movimentacoes
      .filter((m) => {
        console.log(
          `Comparando: m.produtoId (${m.produtoId}) === produto.id (${produto.id})`,
        );
        return m.produtoId === produto.id;
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    console.log("✅ Histórico filtrado:", historicoFiltrado);
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
            {item.tipo === "ENTRADA" ? "+" : "-"} {item.quantidade}{" "}
            {item.unidadeMedida || "UN"}
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

  const recarregar = () => {
    carregarHistorico();
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "900px", maxHeight: "90vh" }}
      header={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>📋 Histórico de Movimentações - {produto?.nome || ""}</span>
          <Button
            icon="pi pi-refresh"
            className="p-button-rounded p-button-text"
            onClick={recarregar}
            tooltip="Recarregar"
          />
        </div>
      }
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
                {produto.estoqueAtual} {produto.unidadeMedida}
              </span>
            </div>
          </div>
        </div>
      )}

      {historico.length > 0 ? (
        <>
          <h3 style={{ marginBottom: "1rem" }}>📊 Timeline de Movimentações</h3>
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              marginBottom: "2rem",
            }}
          >
            <Timeline
              value={historico}
              content={customizedContent}
              marker={customizedMarker}
            />
          </div>

          <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            📋 Tabela Detalhada
          </h3>
          <DataTable
            value={historico}
            paginator
            rows={5}
            responsiveLayout="scroll"
          >
            <Column
              field="tipo"
              header="Tipo"
              body={tipoBodyTemplate}
              sortable
            />
            <Column field="quantidade" header="Quantidade" sortable />
            <Column
              field="data"
              header="Data/Hora"
              body={dataBodyTemplate}
              sortable
            />
            <Column
              field="observacao"
              header="Observação"
              style={{ minWidth: "200px" }}
            />
          </DataTable>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <strong>📈 Resumo Estatístico:</strong>
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
                ⬇️ Entradas:{" "}
                <strong>
                  {historico.filter((h) => h.tipo === "ENTRADA").length}
                </strong>
              </div>
              <div style={{ color: "#ef4444" }}>
                ⬆️ Saídas:{" "}
                <strong>
                  {historico.filter((h) => h.tipo === "SAIDA").length}
                </strong>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <i
            className="pi pi-inbox"
            style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3 }}
          ></i>
          <p style={{ fontSize: "1.1rem" }}>
            Nenhuma movimentação registrada para este produto
          </p>
          <p style={{ fontSize: "0.9rem", color: "#999" }}>
            As movimentações aparecerão aqui após registrar entradas ou saídas
          </p>
          <Button
            label="Fazer uma Movimentação"
            icon="pi pi-plus"
            className="p-button-success mt-3"
            onClick={onHide}
          />
        </div>
      )}
    </Dialog>
  );
};

export default HistoricoProduto;
