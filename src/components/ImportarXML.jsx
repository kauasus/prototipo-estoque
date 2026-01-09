import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";

const ImportarXML = ({ onImport }) => {
  const [visible, setVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [selectedProdutos, setSelectedProdutos] = useState([]);
  const [fornecedorNF, setFornecedorNF] = useState(null);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const categorizarPorNCM = (ncm) => {
    if (!ncm) return "Outros";
    const codigo = ncm.substring(0, 2);

    const categorias = {
      "01-05": "Alimentos",
      "06-14": "Alimentos",
      "15-24": "Alimentos",
      22: "Bebidas",
      "28-38": "Limpeza",
      "33-34": "Higiene",
      "84-85": "Eletrônicos",
      "90-92": "Eletrônicos",
    };

    for (let range in categorias) {
      const [min, max] = range.split("-").map(Number);
      const cod = parseInt(codigo);
      if (cod >= min && cod <= max) return categorias[range];
    }

    return "Outros";
  };

  const getTagValue = (xmlDoc, tagName) => {
    const elements = xmlDoc.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent.trim() : "";
  };

  const extrairFornecedor = (xmlDoc) => {
    console.log("Iniciando extração do fornecedor...");

    // Busca a tag <emit>
    const emitElements = xmlDoc.getElementsByTagName("emit");

    if (emitElements.length === 0) {
      console.warn("Tag <emit> não encontrada no XML");
      return null;
    }

    const emit = emitElements[0];
    console.log("Tag <emit> encontrada:", emit);

    // Extrai CNPJ
    const cnpjElements = emit.getElementsByTagName("CNPJ");
    const cnpj =
      cnpjElements.length > 0 ? cnpjElements[0].textContent.trim() : "";

    // Extrai xNome (Razão Social)
    const xNomeElements = emit.getElementsByTagName("xNome");
    const razaoSocial =
      xNomeElements.length > 0 ? xNomeElements[0].textContent.trim() : "";

    // Extrai xFant (Nome Fantasia)
    const xFantElements = emit.getElementsByTagName("xFant");
    const nomeFantasia =
      xFantElements.length > 0
        ? xFantElements[0].textContent.trim()
        : razaoSocial;

    // Extrai IE (Inscrição Estadual)
    const ieElements = emit.getElementsByTagName("IE");
    const ie = ieElements.length > 0 ? ieElements[0].textContent.trim() : "";

    // Extrai IM (Inscrição Municipal)
    const imElements = emit.getElementsByTagName("IM");
    const im = imElements.length > 0 ? imElements[0].textContent.trim() : "";

    // Extrai CNAE
    const cnaeElements = emit.getElementsByTagName("CNAE");
    const cnae =
      cnaeElements.length > 0 ? cnaeElements[0].textContent.trim() : "";

    // Extrai CRT (Código de Regime Tributário)
    const crtElements = emit.getElementsByTagName("CRT");
    const crt = crtElements.length > 0 ? crtElements[0].textContent.trim() : "";

    // Busca enderEmit
    const enderEmitElements = emit.getElementsByTagName("enderEmit");
    let endereco = "";
    let numero = "";
    let complemento = "";
    let bairro = "";
    let cidade = "";
    let estado = "";
    let cep = "";
    let pais = "";
    let telefone = "";

    if (enderEmitElements.length > 0) {
      const enderEmit = enderEmitElements[0];

      const xLgrElements = enderEmit.getElementsByTagName("xLgr");
      endereco =
        xLgrElements.length > 0 ? xLgrElements[0].textContent.trim() : "";

      const nroElements = enderEmit.getElementsByTagName("nro");
      numero = nroElements.length > 0 ? nroElements[0].textContent.trim() : "";

      const xCplElements = enderEmit.getElementsByTagName("xCpl");
      complemento =
        xCplElements.length > 0 ? xCplElements[0].textContent.trim() : "";

      const xBairroElements = enderEmit.getElementsByTagName("xBairro");
      bairro =
        xBairroElements.length > 0 ? xBairroElements[0].textContent.trim() : "";

      const cMunElements = enderEmit.getElementsByTagName("cMun");
      const codigoMunicipio =
        cMunElements.length > 0 ? cMunElements[0].textContent.trim() : "";

      const xMunElements = enderEmit.getElementsByTagName("xMun");
      cidade =
        xMunElements.length > 0 ? xMunElements[0].textContent.trim() : "";

      const ufElements = enderEmit.getElementsByTagName("UF");
      estado = ufElements.length > 0 ? ufElements[0].textContent.trim() : "";

      const cepElements = enderEmit.getElementsByTagName("CEP");
      cep = cepElements.length > 0 ? cepElements[0].textContent.trim() : "";

      const cPaisElements = enderEmit.getElementsByTagName("cPais");
      const xPaisElements = enderEmit.getElementsByTagName("xPais");
      pais =
        xPaisElements.length > 0 ? xPaisElements[0].textContent.trim() : "";

      const foneElements = enderEmit.getElementsByTagName("fone");
      telefone =
        foneElements.length > 0 ? foneElements[0].textContent.trim() : "";
    }

    console.log("Dados extraídos do fornecedor:", {
      cnpj,
      razaoSocial,
      nomeFantasia,
      ie,
      im,
      cnae,
      crt,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      pais,
      telefone,
    });

    // Formata CNPJ
    const cnpjFormatado =
      cnpj.length === 14
        ? cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
        : cnpj;

    // Formata telefone
    const telefoneFormatado =
      telefone.length >= 10
        ? telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
        : telefone;

    // Formata CEP
    const cepFormatado =
      cep.length === 8 ? cep.replace(/(\d{5})(\d{3})/, "$1-$2") : cep;

    // Monta endereço completo
    let enderecoCompleto = endereco;
    if (numero) enderecoCompleto += `, ${numero}`;
    if (complemento) enderecoCompleto += ` - ${complemento}`;
    if (bairro) enderecoCompleto += ` - ${bairro}`;

    return {
      cnpj: cnpjFormatado,
      razaoSocial,
      nomeFantasia,
      telefone: telefoneFormatado,
      email: "",
      endereco: enderecoCompleto,
      cidade,
      estado,
      cep: cepFormatado,
      contato: "",
      observacoes: `Importado via NF-e | IE: ${ie} | IM: ${im} | CNAE: ${cnae} | CRT: ${crt}`,
    };
  };

  const parseXML = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    console.log("XML parseado:", xmlDoc);

    // Extrai dados do fornecedor
    const fornecedor = extrairFornecedor(xmlDoc);
    console.log("Fornecedor extraído:", fornecedor);
    setFornecedorNF(fornecedor);

    const itens = xmlDoc.getElementsByTagName("det");
    const produtosExtraidos = [];

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];

      const prod = item.getElementsByTagName("prod")[0];
      if (!prod) continue;

      const nome =
        prod.getElementsByTagName("xProd")[0]?.textContent || "Sem nome";
      const codigo =
        prod.getElementsByTagName("cEAN")[0]?.textContent ||
        prod.getElementsByTagName("cProd")[0]?.textContent ||
        "";
      const unidade = prod.getElementsByTagName("uCom")[0]?.textContent || "UN";
      const quantidadeTexto =
        prod.getElementsByTagName("qCom")[0]?.textContent || "0";
      const valorTexto =
        prod.getElementsByTagName("vUnCom")[0]?.textContent || "0";
      const ncm = prod.getElementsByTagName("NCM")[0]?.textContent || "";

      const quantidade = parseFloat(quantidadeTexto.replace(",", ".")) || 0;
      const valorUnitario = parseFloat(valorTexto.replace(",", ".")) || 0;

      produtosExtraidos.push({
        id: Date.now() + i + Math.random(),
        codigo: codigo,
        nome: nome,
        categoria: categorizarPorNCM(ncm),
        unidadeMedida: unidade.toUpperCase(),
        precoCompra: Number(valorUnitario.toFixed(2)),
        precoVenda: Number((valorUnitario * 1.3).toFixed(2)),
        estoqueMin: 5,
        estoqueMax: 100,
        estoqueAtual: Math.round(quantidade),
        validade: null,
        fornecedor: fornecedor?.razaoSocial || "",
        fotoUrl: "",
        localizacao: "",
        ncm: ncm,
      });
    }

    return produtosExtraidos;
  };

  const onUpload = (event) => {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const produtosExtraidos = parseXML(e.target.result);
        setProdutos(produtosExtraidos);
        setSelectedProdutos(produtosExtraidos);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `${produtosExtraidos.length} produtos encontrados no XML`,
        });
      } catch (error) {
        console.error("Erro ao processar XML:", error);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao processar XML: " + error.message,
        });
      }
    };

    reader.readAsText(file);
  };

  const importarSelecionados = () => {
    if (selectedProdutos.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione ao menos um produto",
      });
      return;
    }

    console.log("Importando produtos:", selectedProdutos);
    console.log("Fornecedor da NF:", fornecedorNF);

    if (onImport && typeof onImport === "function") {
      onImport(selectedProdutos, fornecedorNF);

      toast.current.show({
        severity: "success",
        summary: "Importado!",
        detail: `${selectedProdutos.length} produto(s) importado(s) com sucesso`,
      });

      setTimeout(() => {
        setVisible(false);
        setProdutos([]);
        setSelectedProdutos([]);
        setFornecedorNF(null);
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      }, 1000);
    } else {
      console.error("Função onImport não foi passada corretamente");
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao importar produtos",
      });
    }
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoCompra);
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Importar XML"
        icon="pi pi-upload"
        className="p-button-info"
        onClick={() => setVisible(true)}
      />

      <Dialog
        visible={visible}
        style={{ width: "90vw" }}
        header="📄 Importar Produtos de Nota Fiscal (XML)"
        modal
        onHide={() => {
          setVisible(false);
          setProdutos([]);
          setSelectedProdutos([]);
          setFornecedorNF(null);
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            name="xmlFile"
            accept=".xml"
            maxFileSize={5000000}
            customUpload
            uploadHandler={onUpload}
            auto
            chooseLabel="Selecionar XML da Nota Fiscal"
          />
        </div>

        {fornecedorNF && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "#f0f9ff",
              border: "2px solid #0ea5e9",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.75rem 0",
                color: "#0369a1",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i className="pi pi-building" style={{ fontSize: "1.2rem" }}></i>
              Fornecedor Identificado na NF-e
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <strong>CNPJ:</strong> {fornecedorNF.cnpj}
              </div>
              <div>
                <strong>Razão Social:</strong> {fornecedorNF.razaoSocial}
              </div>
              <div>
                <strong>Nome Fantasia:</strong> {fornecedorNF.nomeFantasia}
              </div>
              <div>
                <strong>Telefone:</strong> {fornecedorNF.telefone || "-"}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <strong>Endereço:</strong> {fornecedorNF.endereco}
              </div>
              <div>
                <strong>Cidade/UF:</strong> {fornecedorNF.cidade} -{" "}
                {fornecedorNF.estado}
              </div>
              <div>
                <strong>CEP:</strong> {fornecedorNF.cep}
              </div>
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem",
                background: "#e0f2fe",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            >
              <i
                className="pi pi-info-circle"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Este fornecedor será cadastrado automaticamente se ainda não
              existir no sistema.
            </div>
          </div>
        )}

        {produtos.length > 0 && (
          <>
            <p
              style={{
                marginBottom: "1rem",
                color: "#666",
                fontWeight: "bold",
              }}
            >
              ✅ Produtos encontrados: {produtos.length}
            </p>

            <DataTable
              value={produtos}
              selection={selectedProdutos}
              onSelectionChange={(e) => setSelectedProdutos(e.value)}
              dataKey="id"
              paginator
              rows={10}
              responsiveLayout="scroll"
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              />
              <Column
                field="codigo"
                header="Código"
                sortable
                style={{
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <Column field="nome" header="Produto" sortable />
              <Column field="unidadeMedida" header="UN" />
              <Column field="categoria" header="Categoria" sortable />
              <Column
                field="precoCompra"
                header="Preço"
                body={priceBodyTemplate}
                sortable
              />
              <Column field="estoqueAtual" header="Qtde" sortable />
            </DataTable>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text p-button-secondary"
                onClick={() => {
                  setVisible(false);
                  setProdutos([]);
                  setSelectedProdutos([]);
                  setFornecedorNF(null);
                }}
              />
              <Button
                label={`Importar (${selectedProdutos.length})`}
                icon="pi pi-check"
                className="p-button-success"
                onClick={importarSelecionados}
                disabled={selectedProdutos.length === 0}
              />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ImportarXML;
