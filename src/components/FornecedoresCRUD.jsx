import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { FilterMatchMode } from "primereact/api";

const FornecedoresCRUD = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorDialog, setFornecedorDialog] = useState(false);
  const [deleteFornecedorDialog, setDeleteFornecedorDialog] = useState(false);
  const [fornecedor, setFornecedor] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const toast = useRef(null);

  const emptyFornecedor = {
    id: null,
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  };

  useEffect(() => {
    const savedFornecedores = localStorage.getItem("fornecedores");
    if (savedFornecedores) {
      setFornecedores(JSON.parse(savedFornecedores));
    }

    // Registra função global para adicionar fornecedor
    window.adicionarFornecedor = (novoFornecedor) => {
      setFornecedores((prev) => {
        const existe = prev.find((f) => f.cnpj === novoFornecedor.cnpj);
        if (existe) {
          console.log("Fornecedor já existe:", novoFornecedor.cnpj);
          return prev;
        }
        const fornecedorComId = { ...novoFornecedor, id: Date.now() };
        const novosF = [...prev, fornecedorComId];
        localStorage.setItem("fornecedores", JSON.stringify(novosF));
        return novosF;
      });
    };
  }, []);

  useEffect(() => {
    if (fornecedores.length > 0) {
      localStorage.setItem("fornecedores", JSON.stringify(fornecedores));
    }
  }, [fornecedores]);

  const openNew = () => {
    setFornecedor(emptyFornecedor);
    setSubmitted(false);
    setFornecedorDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setFornecedorDialog(false);
  };

  const hideDeleteFornecedorDialog = () => {
    setDeleteFornecedorDialog(false);
  };

  const saveFornecedor = () => {
    setSubmitted(true);

    if (fornecedor.cnpj.trim() && fornecedor.razaoSocial.trim()) {
      let _fornecedores = [...fornecedores];

      if (fornecedor.id) {
        const index = _fornecedores.findIndex((f) => f.id === fornecedor.id);
        _fornecedores[index] = fornecedor;
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Fornecedor atualizado",
          life: 3000,
        });
      } else {
        fornecedor.id = Date.now();
        _fornecedores.push(fornecedor);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Fornecedor cadastrado",
          life: 3000,
        });
      }

      setFornecedores(_fornecedores);
      setFornecedorDialog(false);
      setFornecedor(emptyFornecedor);
    }
  };

  const editFornecedor = (fornecedor) => {
    setFornecedor({ ...fornecedor });
    setFornecedorDialog(true);
  };

  const confirmDeleteFornecedor = (fornecedor) => {
    setFornecedor(fornecedor);
    setDeleteFornecedorDialog(true);
  };

  const deleteFornecedor = () => {
    let _fornecedores = fornecedores.filter((f) => f.id !== fornecedor.id);
    setFornecedores(_fornecedores);
    setDeleteFornecedorDialog(false);
    setFornecedor(emptyFornecedor);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Fornecedor excluído",
      life: 3000,
    });
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _fornecedor = { ...fornecedor };
    _fornecedor[`${name}`] = val;
    setFornecedor(_fornecedor);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const leftToolbarTemplate = () => {
    return (
      <Button
        label="Novo Fornecedor"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={openNew}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning"
          onClick={() => editFornecedor(rowData)}
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => confirmDeleteFornecedor(rowData)}
          tooltip="Excluir"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">🏢 Gerenciar Fornecedores</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar fornecedor..."
        />
      </span>
    </div>
  );

  const fornecedorDialogFooter = (
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
        onClick={saveFornecedor}
      />
    </>
  );

  const deleteFornecedorDialogFooter = (
    <>
      <Button
        label="Não"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteFornecedorDialog}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={deleteFornecedor}
      />
    </>
  );

  return (
    <div>
      <Toast ref={toast} />

      <Toolbar className="mb-4" left={leftToolbarTemplate} />

      <DataTable
        value={fornecedores}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        globalFilterFields={["cnpj", "razaoSocial", "nomeFantasia", "cidade"]}
        header={header}
        emptyMessage="Nenhum fornecedor cadastrado"
        responsiveLayout="scroll"
      >
        <Column
          field="cnpj"
          header="CNPJ"
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          field="razaoSocial"
          header="Razão Social"
          sortable
          style={{ minWidth: "250px" }}
        />
        <Column
          field="nomeFantasia"
          header="Nome Fantasia"
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column field="telefone" header="Telefone" sortable />
        <Column field="cidade" header="Cidade" sortable />
        <Column field="estado" header="UF" sortable />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "120px" }}
        />
      </DataTable>

      <Dialog
        visible={fornecedorDialog}
        style={{ width: "700px" }}
        header="🏢 Dados do Fornecedor"
        modal
        className="p-fluid"
        footer={fornecedorDialogFooter}
        onHide={hideDialog}
      >
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="cnpj">CNPJ *</label>
            <InputMask
              id="cnpj"
              value={fornecedor?.cnpj || ""}
              onChange={(e) => onInputChange(e, "cnpj")}
              mask="99.999.999/9999-99"
              required
              className={submitted && !fornecedor?.cnpj ? "p-invalid" : ""}
            />
            {submitted && !fornecedor?.cnpj && (
              <small className="p-error">CNPJ é obrigatório.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="razaoSocial">Razão Social *</label>
            <InputText
              id="razaoSocial"
              value={fornecedor?.razaoSocial || ""}
              onChange={(e) => onInputChange(e, "razaoSocial")}
              required
              className={
                submitted && !fornecedor?.razaoSocial ? "p-invalid" : ""
              }
            />
            {submitted && !fornecedor?.razaoSocial && (
              <small className="p-error">Razão Social é obrigatória.</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="nomeFantasia">Nome Fantasia</label>
            <InputText
              id="nomeFantasia"
              value={fornecedor?.nomeFantasia || ""}
              onChange={(e) => onInputChange(e, "nomeFantasia")}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="telefone">Telefone</label>
            <InputMask
              id="telefone"
              value={fornecedor?.telefone || ""}
              onChange={(e) => onInputChange(e, "telefone")}
              mask="(99) 99999-9999"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="email">E-mail</label>
            <InputText
              id="email"
              value={fornecedor?.email || ""}
              onChange={(e) => onInputChange(e, "email")}
              type="email"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="cep">CEP</label>
            <InputMask
              id="cep"
              value={fornecedor?.cep || ""}
              onChange={(e) => onInputChange(e, "cep")}
              mask="99999-999"
            />
          </div>

          <div className="field col-12">
            <label htmlFor="endereco">Endereço</label>
            <InputText
              id="endereco"
              value={fornecedor?.endereco || ""}
              onChange={(e) => onInputChange(e, "endereco")}
            />
          </div>

          <div className="field col-12 md:col-8">
            <label htmlFor="cidade">Cidade</label>
            <InputText
              id="cidade"
              value={fornecedor?.cidade || ""}
              onChange={(e) => onInputChange(e, "cidade")}
            />
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="estado">Estado (UF)</label>
            <InputText
              id="estado"
              value={fornecedor?.estado || ""}
              onChange={(e) => onInputChange(e, "estado")}
              maxLength={2}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={deleteFornecedorDialog}
        style={{ width: "450px" }}
        header="⚠️ Confirmar Exclusão"
        modal
        footer={deleteFornecedorDialogFooter}
        onHide={hideDeleteFornecedorDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {fornecedor && (
            <span>
              Tem certeza que deseja excluir <b>{fornecedor.razaoSocial}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default FornecedoresCRUD;
