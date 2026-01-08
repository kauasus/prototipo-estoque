import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"; // popup pra criar e editar
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";

const ProdutosCRUD = () => {
  const [produtos, setProdutos] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [produto, setProduto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef(null);

  const unidadesMedida = [
    { label: "Unidade", value: "UN" },
    { label: "Caixa", value: "CX" },
    { label: "Pacote", value: "PC" },
    { label: "Quilograma", value: "KG" },
    { label: "Litro", value: "L" },
    { label: "Metro", value: "M" },
  ];

  const categorias = [
    { label: "Alimentos", value: "ALIMENTOS" },
    { label: "Bebidas", value: "BEBIDAS" },
    { label: "Limpeza", value: "LIMPEZA" },
    { label: "Higiene", value: "HIGIENE" },
    { label: "Eletrônicos", value: "ELETRONICOS" },
    { label: "Outros", value: "OUTROS" },
  ];

  const emptyProduto = {
    id: null,
    nome: "",
    unidadeMedida: "",
    categoria: "",
    precoCompra: 0,
    estoqueMin: 0,
    estoqueMax: 0,
    estoqueAtual: 0,
    localizacao: "",
    validade: null,
    fabricante: "",
  };

  useEffect(() => {
    const storedProdutos = localStorage.getItem("produtos"); // busca produtos salvos no localstorge
    if (storedProdutos) {
      setProdutos(JSON.parse(storedProdutos));
    }
  }, []);

  const saveProdutos = (prods) => {
    localStorage.setItem("produtos", JSON.stringify(prods));
    setProdutos(prods);
  };

  const openNew = () => {
    setProduto(emptyProduto);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setDialogVisible(false);
  };

  const saveProduto = () => {
    setSubmitted(true);

    if (produto.nome.trim() && produto.unidadeMedida && produto.categoria) {
      let _produtos = [...produtos];
      let _produto = { ...produto };

      if (produto.id) {
        const index = _produtos.findIndex((p) => p.id === produto.id);
        _produtos[index] = _produto;
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto atualizado",
        });
      } else {
        _produto.id = Date.now();
        _produtos.push(_produto);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto criado",
        });
      }

      saveProdutos(_produtos);
      setDialogVisible(false);
      setProduto(emptyProduto);
    }
  };

  const editProduto = (produto) => {
    setProduto({ ...produto });
    setDialogVisible(true);
  };

  const deleteProduto = (produto) => {
    let _produtos = produtos.filter((p) => p.id !== produto.id);
    saveProdutos(_produtos);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Produto excluído",
    });
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _produto = { ...produto };
    _produto[name] = val;
    setProduto(_produto);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _produto = { ...produto };
    _produto[name] = val;
    setProduto(_produto);
  };

  const leftToolbarTemplate = () => {
    return (
      <Button
        label="Novo Produto"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={openNew}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning"
          onClick={() => editProduto(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteProduto(rowData)}
        />
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return `R$ ${rowData.precoCompra.toFixed(2)}`;
  };

  const estoqueBodyTemplate = (rowData) => {
    const color =
      rowData.estoqueAtual <= rowData.estoqueMin
        ? "red"
        : rowData.estoqueAtual >= rowData.estoqueMax
          ? "orange"
          : "green";
    return (
      <span style={{ color, fontWeight: "bold" }}>{rowData.estoqueAtual}</span>
    );
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button label="Salvar" icon="pi pi-check" onClick={saveProduto} />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <Toolbar
        className="mb-4"
        left={leftToolbarTemplate}
        style={{ marginBottom: "1rem" }}
      />

      <DataTable
        value={produtos}
        paginator
        rows={10}
        dataKey="id"
        emptyMessage="Nenhum produto cadastrado"
      >
        <Column field="nome" header="Produto" sortable />
        <Column field="unidadeMedida" header="Unidade" sortable />
        <Column field="categoria" header="Categoria" sortable />
        <Column
          field="precoCompra"
          header="Preço Compra"
          body={priceBodyTemplate}
          sortable
        />
        <Column
          field="estoqueAtual"
          header="Estoque"
          body={estoqueBodyTemplate}
          sortable
        />
        <Column field="localizacao" header="Localização" sortable />
        <Column field="fabricante" header="Fabricante" sortable />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      <Dialog
        visible={dialogVisible}
        style={{ width: "600px" }}
        header="Detalhes do Produto"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label htmlFor="nome">Produto *</label>
            <InputText
              id="nome"
              value={produto?.nome}
              onChange={(e) => onInputChange(e, "nome")}
              required
              className={submitted && !produto?.nome ? "p-invalid" : ""}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label htmlFor="unidadeMedida">Unidade de Medida *</label>
              <Dropdown
                id="unidadeMedida"
                value={produto?.unidadeMedida}
                options={unidadesMedida}
                onChange={(e) => onInputChange(e, "unidadeMedida")}
                placeholder="Selecione"
              />
            </div>
            <div>
              <label htmlFor="categoria">Categoria *</label>
              <Dropdown
                id="categoria"
                value={produto?.categoria}
                options={categorias}
                onChange={(e) => onInputChange(e, "categoria")}
                placeholder="Selecione"
              />
            </div>
          </div>

          <div>
            <label htmlFor="precoCompra">Preço de Compra</label>
            <InputNumber
              id="precoCompra"
              value={produto?.precoCompra}
              onValueChange={(e) => onInputNumberChange(e, "precoCompra")}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label htmlFor="estoqueMin">Estoque Mínimo</label>
              <InputNumber
                id="estoqueMin"
                value={produto?.estoqueMin}
                onValueChange={(e) => onInputNumberChange(e, "estoqueMin")}
              />
            </div>
            <div>
              <label htmlFor="estoqueMax">Estoque Máximo</label>
              <InputNumber
                id="estoqueMax"
                value={produto?.estoqueMax}
                onValueChange={(e) => onInputNumberChange(e, "estoqueMax")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="localizacao">Localização</label>
            <InputText
              id="localizacao"
              value={produto?.localizacao}
              onChange={(e) => onInputChange(e, "localizacao")}
            />
          </div>

          <div>
            <label htmlFor="validade">Validade</label>
            <Calendar
              id="validade"
              value={produto?.validade}
              onChange={(e) => onInputChange(e, "validade")}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>

          <div>
            <label htmlFor="fabricante">Fabricante</label>
            <InputText
              id="fabricante"
              value={produto?.fabricante}
              onChange={(e) => onInputChange(e, "fabricante")}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ProdutosCRUD;
