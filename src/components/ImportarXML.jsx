import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

const ImportarXML = ({ onImportar }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [produtosXML, setProdutosXML] = useState([]);
  const [selectedProdutos, setSelectedProdutos] = useState([]);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const parseXML = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Verifica se há erros no XML
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("XML inválido");
    }

    // Extrai os produtos (tag <det> contém cada produto)
    const produtos = [];
    const detElements = xmlDoc.getElementsByTagName("det");

    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];

      // Extrai informações do produto
      const prod = det.getElementsByTagName("prod")[0];

      if (prod) {
        const nome = prod.getElementsByTagName("xProd")[0]?.textContent || "";
        const codigo = prod.getElementsByTagName("cProd")[0]?.textContent || "";
        const unidade =
          prod.getElementsByTagName("uCom")[0]?.textContent || "UN";
        const quantidade = parseFloat(
          prod.getElementsByTagName("qCom")[0]?.textContent || 0,
        );
        const valorUnitario = parseFloat(
          prod.getElementsByTagName("vUnCom")[0]?.textContent || 0,
        );
        const ncm = prod.getElementsByTagName("NCM")[0]?.textContent || "";
        const cfop = prod.getElementsByTagName("CFOP")[0]?.textContent || "";

        // Tenta pegar informações adicionais se existirem
        const ean = prod.getElementsByTagName("cEAN")[0]?.textContent || "";

        produtos.push({
          id: Date.now() + i,
          codigo,
          nome,
          unidadeMedida: unidade.toUpperCase(),
          categoria: categorizarPorNCM(ncm),
          precoCompra: valorUnitario,
          estoqueMin: 0,
          estoqueMax: 0,
          estoqueAtual: Math.floor(quantidade),
          localizacao: "",
          validade: null,
          fabricante: "",
          ncm,
          cfop,
          ean,
          origem: "XML",
        });
      }
    }

    return produtos;
  };

  // Função auxiliar para categorizar produtos baseado no NCM
  const categorizarPorNCM = (ncm) => {
    if (!ncm) return "OUTROS";

    const primeirosDois = ncm.substring(0, 2);

    // Categorização básica por NCM
    if (
      [
        "01",
        "02",
        "03",
        "04",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "23",
      ].includes(primeirosDois)
    ) {
      return "ALIMENTOS";
    } else if (["22"].includes(primeirosDois)) {
      return "BEBIDAS";
    } else if (["33", "34"].includes(primeirosDois)) {
      return "LIMPEZA";
    } else if (["30"].includes(primeirosDois)) {
      return "HIGIENE";
    } else if (["84", "85"].includes(primeirosDois)) {
      return "ELETRONICOS";
    }

    return "OUTROS";
  };

  const onFileSelect = (event) => {
    const file = event.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const xmlText = e.target.result;
        const produtos = parseXML(xmlText);

        if (produtos.length === 0) {
          toast.current.show({
            severity: "warn",
            summary: "Aviso",
            detail: "Nenhum produto encontrado no XML",
          });
          return;
        }

        setProdutosXML(produtos);
        setSelectedProdutos(produtos); // Seleciona todos por padrão

        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `${produtos.length} produto(s) encontrado(s)`,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao processar XML: " + error.message,
        });
      }
    };

    reader.onerror = () => {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao ler o arquivo",
      });
    };

    reader.readAsText(file);
  };

  const confirmarImportacao = () => {
    if (selectedProdutos.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Selecione pelo menos um produto",
      });
      return;
    }

    onImportar(selectedProdutos);

    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: `${selectedProdutos.length} produto(s) importado(s)`,
    });

    // Limpa e fecha
    setProdutosXML([]);
    setSelectedProdutos([]);
    setDialogVisible(false);

    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const priceBodyTemplate = (rowData) => {
    return `R$ ${rowData.precoCompra.toFixed(2)}`;
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => {
          setDialogVisible(false);
          setProdutosXML([]);
          setSelectedProdutos([]);
        }}
      />
      <Button
        label={`Importar (${selectedProdutos.length})`}
        icon="pi pi-check"
        onClick={confirmarImportacao}
        disabled={selectedProdutos.length === 0}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <Button
        label="Importar XML"
        icon="pi pi-upload"
        className="p-button-info"
        onClick={() => setDialogVisible(true)}
      />

      <Dialog
        visible={dialogVisible}
        style={{ width: "900px" }}
        header="Importar Produtos de Nota Fiscal (XML)"
        modal
        footer={dialogFooter}
        onHide={() => {
          setDialogVisible(false);
          setProdutosXML([]);
          setSelectedProdutos([]);
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            accept=".xml"
            maxFileSize={5000000}
            chooseLabel="Selecionar XML"
            customUpload
            auto
            uploadHandler={onFileSelect}
          />
          <small
            style={{ display: "block", marginTop: "0.5rem", color: "#6c757d" }}
          >
            Selecione um arquivo XML de NF-e (Nota Fiscal Eletrônica)
          </small>
        </div>

        {produtosXML.length > 0 && (
          <div>
            <h3>Produtos encontrados: {produtosXML.length}</h3>
            <DataTable
              value={produtosXML}
              selection={selectedProdutos}
              onSelectionChange={(e) => setSelectedProdutos(e.value)}
              dataKey="id"
              scrollable
              scrollHeight="400px"
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              />
              <Column
                field="codigo"
                header="Código"
                style={{ minWidth: "100px" }}
              />
              <Column
                field="nome"
                header="Produto"
                style={{ minWidth: "250px" }}
              />
              <Column
                field="unidadeMedida"
                header="UN"
                style={{ minWidth: "80px" }}
              />
              <Column
                field="categoria"
                header="Categoria"
                style={{ minWidth: "120px" }}
              />
              <Column
                field="precoCompra"
                header="Preço"
                body={priceBodyTemplate}
                style={{ minWidth: "100px" }}
              />
              <Column
                field="estoqueAtual"
                header="Qtde"
                style={{ minWidth: "80px" }}
              />
            </DataTable>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ImportarXML;
