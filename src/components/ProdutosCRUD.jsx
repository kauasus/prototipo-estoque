import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { QRCodeSVG } from "qrcode.react";
import HistoricoProduto from "./HistoricoProduto";
import ImportarXML from "./ImportarXML";

const ProdutosCRUD = () => {
  let emptyProduto = {
    id: null,
    codigo: "",
    nome: "",
    categoria: "",
    unidadeMedida: "UN",
    precoCompra: 0,
    precoVenda: 0,
    estoqueMin: 0,
    estoqueAtual: 0,
    validade: null,
    fornecedor: "",
    fotoUrl: "",
    localizacao: "",
  };

  const [produtos, setProdutos] = useState([]);
  const [produtoDialog, setProdutoDialog] = useState(false);
  const [deleteProdutoDialog, setDeleteProdutoDialog] = useState(false);
  const [produto, setProduto] = useState(emptyProduto);
  const [selectedProdutos, setSelectedProdutos] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [historicoVisible, setHistoricoVisible] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState(null);
  const toast = useRef(null);

  const categorias = [
    "Alimentos",
    "Bebidas",
    "Limpeza",
    "Higiene",
    "Eletrônicos",
    "Outros",
  ];
  const unidades = ["UN", "CX", "PC", "KG", "L", "M"];

  useEffect(() => {
    const data = localStorage.getItem("produtos");
    if (data) setProdutos(JSON.parse(data));
  }, []);

  const saveProduto = () => {
    let _produtos = produtos ? [...produtos] : [];
    let _produto = { ...produto };

    if (_produto.nome.trim()) {
      if (produto.id) {
        const index = _produtos.findIndex((p) => p.id === produto.id);
        _produtos[index] = _produto;
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto Atualizado",
        });
      } else {
        _produto.id = Date.now();
        _produtos.push(_produto);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto Criado",
        });
      }

      setProdutos(_produtos);
      localStorage.setItem("produtos", JSON.stringify(_produtos));
      setProdutoDialog(false);
      setProduto(emptyProduto);
    }
  };

  const editProduto = (produto) => {
    setProduto({
      ...produto,
      validade: produto.validade ? new Date(produto.validade) : null,
    });
    setProdutoDialog(true);
  };

  const confirmDeleteProduto = (produto) => {
    setProduto(produto);
    setDeleteProdutoDialog(true);
  };

  const deleteProduto = () => {
    let _produtos = produtos
      ? produtos.filter((val) => val.id !== produto.id)
      : [];
    setProdutos(_produtos);
    localStorage.setItem("produtos", JSON.stringify(_produtos));
    setDeleteProdutoDialog(false);
    setProduto(emptyProduto);
    toast.current.show({
      severity: "warn",
      summary: "Sucesso",
      detail: "Produto Excluído",
    });
  };

  const importarProdutosXML = (produtosImportados) => {
    console.log("Recebendo produtos para importar:", produtosImportados);

    let _produtos = produtos ? [...produtos] : [];
    let novos = 0;
    let atualizados = 0;

    produtosImportados.forEach((novoProd) => {
      // Garante que os valores são números válidos
      novoProd.precoCompra = Number(novoProd.precoCompra) || 0;
      novoProd.precoVenda = Number(novoProd.precoVenda) || 0;
      novoProd.estoqueAtual = Number(novoProd.estoqueAtual) || 0;
      novoProd.estoqueMin = Number(novoProd.estoqueMin) || 5;

      const existe = _produtos.find(
        (p) => p.codigo === novoProd.codigo && p.codigo !== ""
      );

      if (existe) {
        existe.estoqueAtual =
          Number(existe.estoqueAtual) + Number(novoProd.estoqueAtual);
        atualizados++;
      } else {
        novoProd.id = Date.now() + Math.random();
        _produtos.push(novoProd);
        novos++;
      }
    });

    setProdutos(_produtos);
    localStorage.setItem("produtos", JSON.stringify(_produtos));

    toast.current.show({
      severity: "success",
      summary: "Importação Concluída",
      detail: `${novos} novos produtos, ${atualizados} atualizados`,
      life: 5000,
    });
  };

  // Templates de Coluna
  const imageBodyTemplate = (rowData) => {
    return (
      <img
        src={rowData.fotoUrl || "https://placehold.co/50x50?text=Sem+Foto"}
        alt={rowData.nome}
        style={{
          width: "50px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
    );
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoVenda);
  };


  const validadeBodyTemplate = (rowData) => {
    if (!rowData.validade) return "-";
    const data = new Date(rowData.validade);
    const hoje = new Date();
    const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
    let severity = "success";
    if (diff <= 0) severity = "danger";
    else if (diff <= 15) severity = "warning";

    return <Tag value={data.toLocaleDateString("pt-BR")} severity={severity} />;
  };

  const estoqueBodyTemplate = (rowData) => {
    const severity =
      rowData.estoqueAtual <= rowData.estoqueMin ? "danger" : "success";
    return <Tag value={rowData.estoqueAtual} severity={severity} />;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success"
          onClick={() => editProduto(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-history"
          className="p-button-rounded p-button-info"
          onClick={() => {
            setSelectedProdutoId(rowData.id);
            setHistoricoVisible(true);
          }}
          tooltip="Histórico"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => confirmDeleteProduto(rowData)}
          tooltip="Excluir"
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          label="Novo Produto"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => {
            setProduto(emptyProduto);
            setProdutoDialog(true);
          }}
        />
        <ImportarXML onImport={importarProdutosXML} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar produto..."
        />
      </span>
    );
  };

  const dialogFooter = (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setProdutoDialog(false)}
      />
      <Button label="Salvar" icon="pi pi-check" onClick={saveProduto} />
    </div>
  );

  const deleteDialogFooter = (
    <div>
      <Button
        label="Não"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDeleteProdutoDialog(false)}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={deleteProduto}
      />
    </div>
  );

  return (
    <div className="card">
      <Toast ref={toast} />

      <Toolbar
        className="mb-4"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <DataTable
        value={produtos}
        selection={selectedProdutos}
        onSelectionChange={(e) => setSelectedProdutos(e.value)}
        dataKey="id"
        paginator
        rows={10}
        globalFilter={globalFilter}
        header="📦 Gerenciamento de Produtos"
        responsiveLayout="scroll"
        emptyMessage="Nenhum produto cadastrado"
      >
        <Column
          field="fotoUrl"
          header="Foto"
          body={imageBodyTemplate}
          style={{ width: "80px" }}
        />
        <Column field="codigo" header="Código" sortable />
        <Column field="nome" header="Nome" sortable />
        <Column field="categoria" header="Categoria" sortable />
        <Column field="fornecedor" header="Fornecedor" sortable />
        <Column
          field="precoVenda"
          header="Preço Venda"
          body={priceBodyTemplate}
          sortable
        />
        
        <Column
          field="estoqueAtual"
          header="Estoque"
          body={estoqueBodyTemplate}
          sortable
        />
        <Column
          field="validade"
          header="Validade"
          body={validadeBodyTemplate}
          sortable
        />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "12rem" }}
        />
      </DataTable>

      <Dialog
        visible={produtoDialog}
        style={{ width: "650px" }}
        header="📝 Detalhes do Produto"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={() => setProdutoDialog(false)}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="field">
            <label htmlFor="nome">Nome *</label>
            <InputText
              id="nome"
              value={produto.nome}
              onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="codigo">Código / EAN</label>
            <InputText
              id="codigo"
              value={produto.codigo}
              onChange={(e) =>
                setProduto({ ...produto, codigo: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="categoria">Categoria</label>
            <Dropdown
              id="categoria"
              value={produto.categoria}
              options={categorias}
              onChange={(e) => setProduto({ ...produto, categoria: e.value })}
              placeholder="Selecione"
            />
          </div>
          <div className="field">
            <label htmlFor="unidade">Unidade de Medida</label>
            <Dropdown
              id="unidade"
              value={produto.unidadeMedida}
              options={unidades}
              onChange={(e) =>
                setProduto({ ...produto, unidadeMedida: e.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="fornecedor">Fornecedor</label>
            <InputText
              id="fornecedor"
              value={produto.fornecedor}
              onChange={(e) =>
                setProduto({ ...produto, fornecedor: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="localizacao">Localização</label>
            <InputText
              id="localizacao"
              value={produto.localizacao}
              onChange={(e) =>
                setProduto({ ...produto, localizacao: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="precoCompra">Preço Compra (R$)</label>
            <InputNumber
              id="precoCompra"
              value={produto.precoCompra}
              onValueChange={(e) =>
                setProduto({ ...produto, precoCompra: e.value })
              }
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>
          <div className="field">
            <label htmlFor="precoVenda">Preço Venda (R$)</label>
            <InputNumber
              id="precoVenda"
              value={produto.precoVenda}
              onValueChange={(e) =>
                setProduto({ ...produto, precoVenda: e.value })
              }
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>
          <div className="field">
            <label htmlFor="estoqueAtual">Estoque Atual</label>
            <InputNumber
              id="estoqueAtual"
              value={produto.estoqueAtual}
              onValueChange={(e) =>
                setProduto({ ...produto, estoqueAtual: e.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="estoqueMin">Estoque Mínimo</label>
            <InputNumber
              id="estoqueMin"
              value={produto.estoqueMin}
              onValueChange={(e) =>
                setProduto({ ...produto, estoqueMin: e.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="validade">Data de Validade</label>
            <Calendar
              id="validade"
              value={produto.validade}
              onChange={(e) => setProduto({ ...produto, validade: e.value })}
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
          <div className="field">
            <label htmlFor="fotoUrl">URL da Foto</label>
            <InputText
              id="fotoUrl"
              value={produto.fotoUrl}
              onChange={(e) =>
                setProduto({ ...produto, fotoUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>

        {produto.fotoUrl && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <img
              src={produto.fotoUrl}
              alt="Preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: "8px",
              }}
              onError={(e) =>
                (e.target.src =
                  "https://placehold.co/200x200?text=Erro+ao+Carregar")
              }
            />
          </div>
        )}

        {produto.codigo && (
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              padding: "1rem",
              border: "1px dashed #ccc",
              borderRadius: "8px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              QR Code do Produto
            </label>
            <QRCodeSVG value={produto.codigo} size={120} />
            <p
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginTop: "0.5rem",
              }}
            >
              Código: {produto.codigo}
            </p>
          </div>
        )}
      </Dialog>

      <Dialog
        visible={deleteProdutoDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={deleteDialogFooter}
        onHide={() => setDeleteProdutoDialog(false)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <i
            className="pi pi-exclamation-triangle"
            style={{ fontSize: "2rem", marginRight: "1rem", color: "#f59e0b" }}
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
        produtoId={selectedProdutoId}
      />
    </div>
  );
};

export default ProdutosCRUD;
