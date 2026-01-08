import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";

const MovimentacaoEstoque = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [movimentacao, setMovimentacao] = useState(null);
  const toast = useRef(null);

  const tiposMovimentacao = [
    { label: "Entrada", value: "ENTRADA" },
    { label: "Saída", value: "SAIDA" },
  ];

  const emptyMovimentacao = {
    id: null,
    tipo: "",
    produtoId: null,
    quantidade: 0,
    data: new Date(),
    observacao: "",
  };

  useEffect(() => {
    const storedProdutos = localStorage.getItem("produtos");
    const storedMovimentacoes = localStorage.getItem("movimentacoes");

    if (storedProdutos) {
      setProdutos(JSON.parse(storedProdutos));
    }
    if (storedMovimentacoes) {
      setMovimentacoes(JSON.parse(storedMovimentacoes));
    }
  }, []);

  const openNew = () => {
    setMovimentacao(emptyMovimentacao);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const saveMovimentacao = () => {
    if (
      movimentacao.tipo &&
      movimentacao.produtoId &&
      movimentacao.quantidade > 0
    ) {
      let _movimentacoes = [...movimentacoes];
      let _movimentacao = { ...movimentacao, id: Date.now() };

      // Atualizar estoque do produto
      let _produtos = [...produtos];
      const produtoIndex = _produtos.findIndex(
        (p) => p.id === movimentacao.produtoId,
      );

      if (produtoIndex !== -1) {
        if (movimentacao.tipo === "ENTRADA") {
          _produtos[produtoIndex].estoqueAtual += movimentacao.quantidade;
        } else {
          _produtos[produtoIndex].estoqueAtual -= movimentacao.quantidade;
        }

        localStorage.setItem("produtos", JSON.stringify(_produtos));
        setProdutos(_produtos);
      }

      _movimentacoes.push(_movimentacao);
      localStorage.setItem("movimentacoes", JSON.stringify(_movimentacoes));
      setMovimentacoes(_movimentacoes);

      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: `${movimentacao.tipo === "ENTRADA" ? "Entrada" : "Saída"} registrada`,
      });

      setDialogVisible(false);
      setMovimentacao(emptyMovimentacao);
    }
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _movimentacao = { ...movimentacao };
    _movimentacao[name] = val;
    setMovimentacao(_movimentacao);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _movimentacao = { ...movimentacao };
    _movimentacao[name] = val;
    setMovimentacao(_movimentacao);
  };

  const leftToolbarTemplate = () => {
    return (
      <Button
        label="Nova Movimentação"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={openNew}
      />
    );
  };

  const tipoBodyTemplate = (rowData) => {
    const color = rowData.tipo === "ENTRADA" ? "green" : "red";
    return <span style={{ color, fontWeight: "bold" }}>{rowData.tipo}</span>;
  };

  const produtoBodyTemplate = (rowData) => {
    const produto = produtos.find((p) => p.id === rowData.produtoId);
    return produto ? produto.nome : "-";
  };

  const dataBodyTemplate = (rowData) => {
    return new Date(rowData.data).toLocaleDateString("pt-BR");
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button label="Salvar" icon="pi pi-check" onClick={saveMovimentacao} />
    </div>
  );

  const produtosOptions = produtos.map((p) => ({ label: p.nome, value: p.id }));

  return (
    <div>
      <Toast ref={toast} />
      <Toolbar
        className="mb-4"
        left={leftToolbarTemplate}
        style={{ marginBottom: "1rem" }}
      />

      <DataTable
        value={movimentacoes}
        paginator
        rows={10}
        dataKey="id"
        emptyMessage="Nenhuma movimentação registrada"
      >
        <Column field="tipo" header="Tipo" body={tipoBodyTemplate} sortable />
        <Column
          field="produtoId"
          header="Produto"
          body={produtoBodyTemplate}
          sortable
        />
        <Column field="quantidade" header="Quantidade" sortable />
        <Column field="data" header="Data" body={dataBodyTemplate} sortable />
        <Column field="observacao" header="Observação" />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        style={{ width: "500px" }}
        header="Nova Movimentação"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label htmlFor="tipo">Tipo de Movimentação *</label>
            <Dropdown
              id="tipo"
              value={movimentacao?.tipo}
              options={tiposMovimentacao}
              onChange={(e) => onInputChange(e, "tipo")}
              placeholder="Selecione"
            />
          </div>

          <div>
            <label htmlFor="produtoId">Produto *</label>
            <Dropdown
              id="produtoId"
              value={movimentacao?.produtoId}
              options={produtosOptions}
              onChange={(e) => onInputChange(e, "produtoId")}
              placeholder="Selecione"
              filter
            />
          </div>

          <div>
            <label htmlFor="quantidade">Quantidade *</label>
            <InputNumber
              id="quantidade"
              value={movimentacao?.quantidade}
              onValueChange={(e) => onInputNumberChange(e, "quantidade")}
              min={1}
            />
          </div>

          <div>
            <label htmlFor="observacao">Observação</label>
            <InputText
              id="observacao"
              value={movimentacao?.observacao}
              onChange={(e) => onInputChange(e, "observacao")}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MovimentacaoEstoque;
