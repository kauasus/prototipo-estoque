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
import { Toolbar } from "primereact/toolbar";

const MovimentacaoEstoque = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [movimentacaoDialog, setMovimentacaoDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const emptyMovimentacao = {
    tipo: "ENTRADA",
    produtoId: null,
    quantidade: 0,
    observacao: "",
  };
  
  const [movimentacao, setMovimentacao] = useState(emptyMovimentacao);
  const toast = useRef(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const movData = JSON.parse(localStorage.getItem("movimentacoes") || "[]");
    const prodData = JSON.parse(localStorage.getItem("produtos") || "[]");
    setMovimentacoes(movData);
    setProdutos(prodData);
  };

  const openNew = () => {
    setMovimentacao(emptyMovimentacao);
    setSubmitted(false);
    setMovimentacaoDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setMovimentacaoDialog(false);
  };

  const saveMovimentacao = () => {
    setSubmitted(true);

    if (!movimentacao.produtoId || movimentacao.quantidade <= 0) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Preencha todos os campos corretamente",
        life: 3000,
      });
      return;
    }

    const prodIndex = produtos.findIndex(
      (p) => p.id === movimentacao.produtoId,
    );
    
    if (prodIndex === -1) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Produto não encontrado",
        life: 3000,
      });
      return;
    }

    const prod = { ...produtos[prodIndex] };

    if (
      movimentacao.tipo === "SAIDA" &&
      prod.estoqueAtual < movimentacao.quantidade
    ) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: `Estoque insuficiente! Disponível: ${prod.estoqueAtual} ${prod.unidadeMedida}`,
        life: 4000,
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

    // Cria a movimentação com TODOS os dados necessários
    const novaMov = {
      id: Date.now(),
      tipo: movimentacao.tipo,
      produtoId: movimentacao.produtoId,
      produtoNome: prod.nome,
      quantidade: movimentacao.quantidade,
      unidadeMedida: prod.unidadeMedida,
      observacao: movimentacao.observacao,
      data: new Date().toISOString(),
    };

    const novasMovs = [novaMov, ...movimentacoes];

    // Atualiza estados
    setProdutos(novosProdutos);
    setMovimentacoes(novasMovs);
    
    // Salva no localStorage
    localStorage.setItem("produtos", JSON.stringify(novosProdutos));
    localStorage.setItem("movimentacoes", JSON.stringify(novasMovs));

    console.log('Movimentação salva:', novaMov); // Debug

    // Fecha o dialog e reseta o formulário
    setMovimentacaoDialog(false);
    setMovimentacao(emptyMovimentacao);
    setSubmitted(false);

    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: `${movimentacao.tipo === "ENTRADA" ? "Entrada" : "Saída"} registrada com sucesso!`,
      life: 3000,
    });
  };

  const tipoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.tipo}
        severity={rowData.tipo === "ENTRADA" ? "success" : "danger"}
        icon={rowData.tipo === "ENTRADA" ? "pi pi-arrow-down" : "pi pi-arrow-up"}
      />
    );
  };

  const dataBodyTemplate = (rowData) => {
    return new Date(rowData.data).toLocaleString("pt-BR");
  };

  const quantidadeBodyTemplate = (rowData) => {
    return `${rowData.quantidade} ${rowData.unidadeMedida || "UN"}`;
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

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">🔄 Histórico de Movimentações</h4>
      <span className="text-muted">Total: {movimentacoes.length} registros</span>
    </div>
  );

  const dialogFooter = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        className="p-button-success"
        onClick={saveMovimentacao}
      />
    </>
  );

  return (
    <div>
      <Toast ref={toast} />

      <Toolbar className="mb-4" left={leftToolbarTemplate} />

      <DataTable
        value={movimentacoes}
        paginator
        rows={10}
        dataKey="id"
        header={header}
        emptyMessage="Nenhuma movimentação registrada"
        responsiveLayout="scroll"
        sortField="data"
        sortOrder={-1}
      >
        <Column
          field="data"
          header="Data/Hora"
          body={dataBodyTemplate}
          sortable
          style={{ minWidth: "180px" }}
        />
        <Column 
          field="tipo" 
          header="Tipo" 
          body={tipoBodyTemplate} 
          sortable 
          style={{ minWidth: "120px" }}
        />
        <Column
          field="produtoNome"
          header="Produto"
          sortable
          style={{ minWidth: "250px" }}
        />
        <Column
          field="quantidade"
          header="Quantidade"
          body={quantidadeBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="observacao"
          header="Observação"
          style={{ minWidth: "200px" }}
        />
      </DataTable>

      <Dialog
        visible={movimentacaoDialog}
        style={{ width: "500px" }}
        header="📦 Registrar Movimentação"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="formgrid grid">
          <div className="field col-12">
            <label htmlFor="tipo">Tipo de Movimentação *</label>
            <Dropdown
              id="tipo"
              value={movimentacao.tipo}
              options={[
                { label: "⬇️ Entrada (Compra/Devolução)", value: "ENTRADA" },
                { label: "⬆️ Saída (Venda/Uso)", value: "SAIDA" },
              ]}
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, tipo: e.value })
              }
              placeholder="Selecione o tipo"
            />
          </div>

          <div className="field col-12">
            <label htmlFor="produto">Produto *</label>
            <Dropdown
              id="produto"
              value={movimentacao.produtoId}
              options={produtos}
              optionLabel="nome"
              optionValue="id"
              filter
              filterBy="nome,codigo"
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, produtoId: e.value })
              }
              placeholder="Selecione o produto"
              emptyMessage="Nenhum produto cadastrado"
              className={submitted && !movimentacao.produtoId ? "p-invalid" : ""}
            />
            {submitted && !movimentacao.produtoId && (
              <small className="p-error">Produto é obrigatório.</small>
            )}
          </div>

          <div className="field col-12">
            <label htmlFor="quantidade">Quantidade *</label>
            <InputNumber
              id="quantidade"
              value={movimentacao.quantidade}
              onValueChange={(e) =>
                setMovimentacao({ ...movimentacao, quantidade: e.value })
              }
              min={1}
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-danger"
              incrementButtonClassName="p-button-success"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className={submitted && movimentacao.quantidade <= 0 ? "p-invalid" : ""}
            />
            {submitted && movimentacao.quantidade <= 0 && (
              <small className="p-error">Quantidade deve ser maior que zero.</small>
            )}
          </div>

          <div className="field col-12">
            <label htmlFor="observacao">Observação</label>
            <InputText
              id="observacao"
              value={movimentacao.observacao}
              onChange={(e) =>
                setMovimentacao({ ...movimentacao, observacao: e.target.value })
              }
              placeholder="Ex: Compra da NF 12345, Venda para cliente X..."
            />
          </div>

          {movimentacao.produtoId && (
            <div className="field col-12">
              <div
                style={{
                  padding: "1rem",
                  background: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bfdbfe",
                }}
              >
                <strong>ℹ️ Estoque Atual:</strong>
                <span style={{ marginLeft: "0.5rem", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {produtos.find((p) => p.id === movimentacao.produtoId)?.estoqueAtual || 0}{" "}
                  {produtos.find((p) => p.id === movimentacao.produtoId)?.unidadeMedida || "UN"}
                </span>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default MovimentacaoEstoque;