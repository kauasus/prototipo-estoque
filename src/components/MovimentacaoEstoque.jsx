import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";

const MovimentacaoEstoque = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [movimentacaoDialog, setMovimentacaoDialog] = useState(false);
  const [movimentacao, setMovimentacao] = useState({
    tipo: "ENTRADA",
    produtoId: null,
    quantidade: 0,
    observacao: "",
  });
  const toast = useRef(null);

  useEffect(() => {
    const movData = JSON.parse(localStorage.getItem("movimentacoes") || "[]");
    const prodData = JSON.parse(localStorage.getItem("produtos") || "[]");
    setMovimentacoes(movData);
    setProdutos(prodData);
  }, []);

  const saveMovimentacao = () => {
    if (!movimentacao.produtoId || movimentacao.quantidade <= 0) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Preencha todos os campos corretamente",
      });
      return;
    }

    const prodIndex = produtos.findIndex(
      (p) => p.id === movimentacao.produtoId,
    );
    const prod = { ...produtos[prodIndex] };

    if (
      movimentacao.tipo === "SAIDA" &&
      prod.estoqueAtual < movimentacao.quantidade
    ) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Estoque insuficiente",
      });
      return;
    }

    // Atualiza estoque
    if (movimentacao.tipo === "ENTRADA") {
      prod.estoqueAtual += movimentacao.quantidade;
    } else {
      prod.estoqueAtual -= movimentacao.quantidade;
    }

    const novosProdutos = [...produtos];
    novosProdutos[prodIndex] = prod;

    const novaMov = {
      ...movimentacao,
      id: Date.now(),
      data: new Date().toISOString(),
      produtoNome: prod.nome,
    };

    const novasMovs = [novaMov, ...movimentacoes];

    setProdutos(novosProdutos);
    setMovimentacoes(novasMovs);
    localStorage.setItem("produtos", JSON.stringify(novosProdutos));
    localStorage.setItem("movimentacoes", JSON.stringify(novasMovs));

    setMovimentacaoDialog(false);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Movimentação registrada",
    });
  };

  const tipoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.tipo}
        severity={rowData.tipo === "ENTRADA" ? "success" : "danger"}
      />
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <Button
          label="Nova Movimentação"
          icon="pi pi-plus"
          onClick={() => setMovimentacaoDialog(true)}
        />
      </div>

      <DataTable
        value={movimentacoes}
        paginator
        rows={10}
        sortField="data"
        sortOrder={-1}
      >
        <Column
          field="data"
          header="Data"
          body={(d) => new Date(d.data).toLocaleString()}
          sortable
        />
        <Column field="tipo" header="Tipo" body={tipoBodyTemplate} sortable />
        <Column field="produtoNome" header="Produto" sortable />
        <Column field="quantidade" header="Qtd" sortable />
        <Column field="observacao" header="Obs" />
      </DataTable>

      <Dialog
        visible={movimentacaoDialog}
        header="Registrar Movimentação"
        modal
        onHide={() => setMovimentacaoDialog(false)}
        style={{ width: "450px" }}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label>Tipo</label>
            <Dropdown
              value={movimentacao.tipo}
              options={[
                { label: "Entrada", value: "ENTRADA" },
                { label: "Saída", value: "SAIDA" },
              ]}
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, tipo: e.value })
              }
            />
          </div>
          <div className="field mb-3">
            <label>Produto</label>
            <Dropdown
              value={movimentacao.produtoId}
              options={produtos}
              optionLabel="nome"
              optionValue="id"
              filter
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, produtoId: e.value })
              }
              placeholder="Selecione o produto"
            />
          </div>
          <div className="field mb-3">
            <label>Quantidade</label>
            <InputNumber
              value={movimentacao.quantidade}
              onValueChange={(e) =>
                setMovimentacao({ ...movimentacao, quantidade: e.value })
              }
              min={1}
            />
          </div>
          <div className="field mb-3">
            <label>Observação</label>
            <InputText
              value={movimentacao.observacao}
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, observacao: e.target.value })
              }
            />
          </div>
          <Button
            label="Salvar"
            icon="pi pi-check"
            onClick={saveMovimentacao}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default MovimentacaoEstoque;
