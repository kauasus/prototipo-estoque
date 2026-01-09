import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { MultiSelect } from "primereact/multiselect";
import { FilterMatchMode } from "primereact/api";
import ImportarXML from "./ImportarXML";
import HistoricoProduto from "./HistoricoProduto";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ProdutosCRUD = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtoDialog, setProdutoDialog] = useState(false);
  const [deleteProdutoDialog, setDeleteProdutoDialog] = useState(false);
  const [produto, setProduto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(null);
  const [historicoVisible, setHistoricoVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  const unidades = [
    { label: "Unidade (UN)", value: "UN" },
    { label: "Caixa (CX)", value: "CX" },
    { label: "Peça (PC)", value: "PC" },
    { label: "Quilograma (KG)", value: "KG" },
    { label: "Litro (L)", value: "L" },
    { label: "Metro (M)", value: "M" },
  ];

  const categorias = [
    { label: "Alimentos", value: "Alimentos" },
    { label: "Bebidas", value: "Bebidas" },
    { label: "Limpeza", value: "Limpeza" },
    { label: "Higiene", value: "Higiene" },
    { label: "Eletrônicos", value: "Eletrônicos" },
    { label: "Outros", value: "Outros" },
  ];

  const emptyProduto = {
    id: null,
    codigo: "",
    nome: "",
    categoria: "",
    unidadeMedida: "UN",
    precoCompra: 0,
    precoVenda: 0,
    estoqueMin: 0,
    estoqueMax: 0,
    estoqueAtual: 0,
    validade: null,
    fornecedor: "",
    fotoUrl: "",
    localizacao: "",
  };

  useEffect(() => {
    const savedProdutos = localStorage.getItem("produtos");
    if (savedProdutos) {
      setProdutos(JSON.parse(savedProdutos));
    }
  }, []);

  useEffect(() => {
    if (produtos.length > 0) {
      localStorage.setItem("produtos", JSON.stringify(produtos));
    }
  }, [produtos]);

  const openNew = () => {
    setProduto(emptyProduto);
    setSubmitted(false);
    setProdutoDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProdutoDialog(false);
  };

  const hideDeleteProdutoDialog = () => {
    setDeleteProdutoDialog(false);
  };

  const saveProduto = () => {
    setSubmitted(true);

    if (produto.nome.trim() && produto.categoria) {
      let _produtos = [...produtos];

      if (produto.id) {
        const index = _produtos.findIndex((p) => p.id === produto.id);
        _produtos[index] = produto;
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto atualizado",
          life: 3000,
        });
      } else {
        produto.id = Date.now();
        _produtos.push(produto);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto cadastrado",
          life: 3000,
        });
      }

      setProdutos(_produtos);
      setProdutoDialog(false);
      setProduto(emptyProduto);
    }
  };

  const editProduto = (produto) => {
    setProduto({ ...produto });
    setProdutoDialog(true);
  };

  const confirmDeleteProduto = (produto) => {
    setProduto(produto);
    setDeleteProdutoDialog(true);
  };

  const deleteProduto = () => {
    let _produtos = produtos.filter((p) => p.id !== produto.id);
    setProdutos(_produtos);
    setDeleteProdutoDialog(false);
    setProduto(emptyProduto);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Produto excluído",
      life: 3000,
    });
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _produto = { ...produto };
    _produto[`${name}`] = val;
    setProduto(_produto);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _produto = { ...produto };
    _produto[`${name}`] = val;
    setProduto(_produto);
  };

  const onCategoryChange = (e) => {
    let _produto = { ...produto };
    _produto["categoria"] = e.value;
    setProduto(_produto);
  };

  const onUnidadeChange = (e) => {
    let _produto = { ...produto };
    _produto["unidadeMedida"] = e.value;
    setProduto(_produto);
  };

  const onDateChange = (e) => {
    let _produto = { ...produto };
    _produto["validade"] = e.value;
    setProduto(_produto);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const importarProdutosXML = (produtosImportados, fornecedorNF) => {
    console.log("Recebendo produtos:", produtosImportados);
    console.log("Recebendo fornecedor:", fornecedorNF);

    // Cadastra o fornecedor automaticamente se existir
    if (fornecedorNF && window.adicionarFornecedor) {
      window.adicionarFornecedor(fornecedorNF);
    }

    let novos = 0;
    let atualizados = 0;

    produtosImportados.forEach((produtoImportado) => {
      const produtoExistente = produtos.find(
        (p) =>
          p.codigo &&
          produtoImportado.codigo &&
          p.codigo === produtoImportado.codigo,
      );

      if (produtoExistente) {
        const index = produtos.findIndex((p) => p.id === produtoExistente.id);
        const produtoAtualizado = {
          ...produtoExistente,
          estoqueAtual:
            produtoExistente.estoqueAtual + produtoImportado.estoqueAtual,
          precoCompra: produtoImportado.precoCompra,
          fornecedor: produtoImportado.fornecedor,
        };

        const _produtos = [...produtos];
        _produtos[index] = produtoAtualizado;
        setProdutos(_produtos);
        atualizados++;
      } else {
        setProdutos((prev) => [...prev, produtoImportado]);
        novos++;
      }
    });

    toast.current.show({
      severity: "success",
      summary: "Importação Concluída",
      detail: `${novos} produto(s) novo(s) e ${atualizados} atualizado(s)`,
      life: 4000,
    });
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(produtos);
    const workbook = {
      Sheets: { Produtos: worksheet },
      SheetNames: ["Produtos"],
    };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      data,
      `produtos_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`,
    );
  };

  const verHistorico = (produto) => {
    setProdutoSelecionado(produto);
    setHistoricoVisible(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Novo Produto"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
        />
        <ImportarXML onImport={importarProdutosXML} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Exportar Excel"
          icon="pi pi-file-excel"
          className="p-button-success"
          onClick={exportExcel}
          disabled={produtos.length === 0}
        />
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoVenda);
  };

  const stockBodyTemplate = (rowData) => {
    const isLowStock = rowData.estoqueAtual <= rowData.estoqueMin;
    return (
      <span
        style={{
          color: isLowStock ? "red" : "green",
          fontWeight: "bold",
        }}
      >
        {rowData.estoqueAtual} {rowData.unidadeMedida}
        {isLowStock && " ⚠️"}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-history"
          className="p-button-rounded p-button-info"
          onClick={() => verHistorico(rowData)}
          tooltip="Ver Histórico"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning"
          onClick={() => editProduto(rowData)}
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => confirmDeleteProduto(rowData)}
          tooltip="Excluir"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">📦 Gerenciar Produtos</h4>
      <div className="flex gap-2">
        <MultiSelect
          value={selectedCategories}
          options={categorias}
          onChange={(e) => setSelectedCategories(e.value)}
          placeholder="Filtrar por Categoria"
          maxSelectedLabels={2}
          style={{ minWidth: "200px" }}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar produto..."
          />
        </span>
      </div>
    </div>
  );

  const produtoDialogFooter = (
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
        onClick={saveProduto}
      />
    </>
  );

  const deleteProdutoDialogFooter = (
    <>
      <Button
        label="Não"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteProdutoDialog}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={deleteProduto}
      />
    </>
  );

  const filteredProdutos =
    selectedCategories && selectedCategories.length > 0
      ? produtos.filter((p) => selectedCategories.includes(p.categoria))
      : produtos;

  return (
    <div>
      <Toast ref={toast} />

      <Toolbar
        className="mb-4"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <DataTable
        value={filteredProdutos}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={["codigo", "nome", "categoria", "fornecedor"]}
        header={header}
        emptyMessage="Nenhum produto cadastrado"
        responsiveLayout="scroll"
      >
        <Column
          field="codigo"
          header="Código"
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="nome"
          header="Produto"
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column field="categoria" header="Categoria" sortable />
        <Column field="unidadeMedida" header="UN" />
        <Column
          field="precoVenda"
          header="Preço"
          body={priceBodyTemplate}
          sortable
        />
        <Column
          field="estoqueAtual"
          header="Estoque"
          body={stockBodyTemplate}
          sortable
        />
        <Column
          field="fornecedor"
          header="Fornecedor"
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "180px" }}
        />
      </DataTable>

      <Dialog
        visible={produtoDialog}
        style={{ width: "700px" }}
        header="📋 Dados do Produto"
        modal
        className="p-fluid"
        footer={produtoDialogFooter}
        onHide={hideDialog}
      >
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="codigo">Código</label>
            <InputText
              id="codigo"
              value={produto?.codigo || ""}
              onChange={(e) => onInputChange(e, "codigo")}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="nome">Nome do Produto *</label>
            <InputText
              id="nome"
              value={produto?.nome || ""}
              onChange={(e) => onInputChange(e, "nome")}
              required
              className={submitted && !produto?.nome ? "p-invalid" : ""}
            />
            {submitted && !produto?.nome && (
              <small className="p-error">Nome é obrigatório.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="categoria">Categoria *</label>
            <Dropdown
              id="categoria"
              value={produto?.categoria}
              options={categorias}
              onChange={onCategoryChange}
              placeholder="Selecione uma categoria"
              className={submitted && !produto?.categoria ? "p-invalid" : ""}
            />
            {submitted && !produto?.categoria && (
              <small className="p-error">Categoria é obrigatória.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="unidadeMedida">Unidade de Medida</label>
            <Dropdown
              id="unidadeMedida"
              value={produto?.unidadeMedida}
              options={unidades}
              onChange={onUnidadeChange}
              placeholder="Selecione"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="precoCompra">Preço de Compra (R$)</label>
            <InputNumber
              id="precoCompra"
              value={produto?.precoCompra}
              onValueChange={(e) => onInputNumberChange(e, "precoCompra")}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="precoVenda">Preço de Venda (R$)</label>
            <InputNumber
              id="precoVenda"
              value={produto?.precoVenda}
              onValueChange={(e) => onInputNumberChange(e, "precoVenda")}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="estoqueMin">Estoque Mínimo</label>
            <InputNumber
              id="estoqueMin"
              value={produto?.estoqueMin}
              onValueChange={(e) => onInputNumberChange(e, "estoqueMin")}
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="estoqueMax">Estoque Máximo</label>
            <InputNumber
              id="estoqueMax"
              value={produto?.estoqueMax}
              onValueChange={(e) => onInputNumberChange(e, "estoqueMax")}
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="estoqueAtual">Estoque Atual</label>
            <InputNumber
              id="estoqueAtual"
              value={produto?.estoqueAtual}
              onValueChange={(e) => onInputNumberChange(e, "estoqueAtual")}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="validade">Data de Validade</label>
            <Calendar
              id="validade"
              value={produto?.validade}
              onChange={onDateChange}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="fornecedor">Fornecedor</label>
            <InputText
              id="fornecedor"
              value={produto?.fornecedor || ""}
              onChange={(e) => onInputChange(e, "fornecedor")}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="localizacao">Localização</label>
            <InputText
              id="localizacao"
              value={produto?.localizacao || ""}
              onChange={(e) => onInputChange(e, "localizacao")}
              placeholder="Ex: Corredor 3, Prateleira B"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="fotoUrl">URL da Foto</label>
            <InputText
              id="fotoUrl"
              value={produto?.fotoUrl || ""}
              onChange={(e) => onInputChange(e, "fotoUrl")}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={deleteProdutoDialog}
        style={{ width: "450px" }}
        header="⚠️ Confirmar Exclusão"
        modal
        footer={deleteProdutoDialogFooter}
        onHide={hideDeleteProdutoDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {produto && (
            <span>
              Tem certeza que deseja excluir <b>{produto.nome}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <HistoricoProduto
        visible={historicoVisible}
        onHide={() => setHistoricoVisible(false)}
        produto={produtoSelecionado}
      />
    </div>
  );
};

export default ProdutosCRUD;
