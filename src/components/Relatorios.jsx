import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Relatorios = () => {
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [tipoRelatorio, setTipoRelatorio] = useState("ESTOQUE_ATUAL");
  const [dadosRelatorio, setDadosRelatorio] = useState([]);

  const tipos = [
    { label: "Estoque Atual", value: "ESTOQUE_ATUAL" },
    { label: "Movimentações (Entradas/Saídas)", value: "MOVIMENTACOES" },
    { label: "Produtos com Estoque Baixo", value: "ESTOQUE_BAIXO" },
  ];

  useEffect(() => {
    gerarPrevia();
  }, [tipoRelatorio, dataInicio, dataFim]);

  const gerarPrevia = () => {
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    const movimentacoes = JSON.parse(
      localStorage.getItem("movimentacoes") || "[]",
    );

    let dados = [];

    if (tipoRelatorio === "ESTOQUE_ATUAL") {
      dados = produtos.map((p) => ({
        Codigo: p.codigo || "-",
        Produto: p.nome,
        Categoria: p.categoria,
        Estoque: p.estoqueAtual,
        Unidade: p.unidadeMedida,
        Preco: p.precoCompra,
        Total: (p.precoCompra * p.estoqueAtual).toFixed(2),
      }));
    } else if (tipoRelatorio === "ESTOQUE_BAIXO") {
      dados = produtos
        .filter((p) => p.estoqueAtual <= p.estoqueMin)
        .map((p) => ({
          Produto: p.nome,
          Atual: p.estoqueAtual,
          Minimo: p.estoqueMin,
          Status: "CRÍTICO",
        }));
    } else if (tipoRelatorio === "MOVIMENTACOES") {
      dados = movimentacoes
        .filter((m) => {
          const dataMov = new Date(m.data);
          const inicio = dataInicio ? new Date(dataInicio) : new Date(0);
          const fim = dataFim ? new Date(dataFim) : new Date();
          return dataMov >= inicio && dataMov <= fim;
        })
        .map((m) => ({
          Data: new Date(m.data).toLocaleString("pt-BR"),
          Tipo: m.tipo,
          Produto: m.produtoNome,
          Quantidade: m.quantidade,
          Obs: m.observacao,
        }));
    }

    setDadosRelatorio(dados);
  };

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosRelatorio);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, `relatorio_${tipoRelatorio.toLowerCase()}.xlsx`);
  };

  return (
    <Card title="📊 Gerador de Relatórios">
      <div
        className="grid p-fluid"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label>Tipo de Relatório</label>
          <Dropdown
            value={tipoRelatorio}
            options={tipos}
            onChange={(e) => setTipoRelatorio(e.value)}
          />
        </div>

        {tipoRelatorio === "MOVIMENTACOES" && (
          <>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label>Data Início</label>
              <Calendar
                value={dataInicio}
                onChange={(e) => setDataInicio(e.value)}
                showIcon
              />
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label>Data Fim</label>
              <Calendar
                value={dataFim}
                onChange={(e) => setDataFim(e.value)}
                showIcon
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            label="Exportar Excel"
            icon="pi pi-file-excel"
            className="p-button-success"
            onClick={exportarExcel}
            disabled={dadosRelatorio.length === 0}
          />
        </div>
      </div>

      <DataTable
        value={dadosRelatorio}
        paginator
        rows={10}
        emptyMessage="Nenhum dado encontrado para os filtros selecionados."
      >
        {dadosRelatorio.length > 0 &&
          Object.keys(dadosRelatorio[0]).map((key) => (
            <Column key={key} field={key} header={key} sortable />
          ))}
      </DataTable>
    </Card>
  );
};

export default Relatorios;
