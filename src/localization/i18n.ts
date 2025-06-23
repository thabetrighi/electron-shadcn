import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        // App
        appName: "electron-shadcn",
        titleHomePage: "Home Page",
        titleSecondPage: "Second Page",
        
        // Common
        cancel: "Cancel",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        view: "View",
        add: "Add",
        create: "Create",
        update: "Update",
        search: "Search",
        filter: "Filter",
        filters: "Filters",
        loading: "Loading...",
        refresh: "Refresh",
        export: "Export",
        import: "Import",
        close: "Close",
        submit: "Submit",
        reset: "Reset",
        confirm: "Confirm",
        
        // Table
        columns: "Columns",
        actions: "Actions",
        noDataFound: "No data found",
        showingResults: "Showing {{count}} of {{total}} results",
        perPage: "per page",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",
        
        // Forms
        required: "Required",
        optional: "Optional",
        validation: {
          required: "{{field}} is required",
          email: "Please enter a valid email address",
          number: "Please enter a valid number",
          min: "{{field}} must be at least {{min}}",
          max: "{{field}} must be at most {{max}}",
          pattern: "{{field}} format is invalid"
        },
        
        // Products
        products: "Products",
        product: "Product",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        deleteProduct: "Delete Product",
        productName: "Product Name",
        productSKU: "SKU",
        productPrice: "Price",
        productStock: "Stock",
        productCategory: "Category",
        productUnit: "Unit",
        productDescription: "Description",
        productActive: "Active",
        productInactive: "Inactive",
        
        // Categories
        categories: "Categories",
        category: "Category",
        addCategory: "Add Category",
        editCategory: "Edit Category",
        deleteCategory: "Delete Category",
        categoryName: "Category Name",
        categoryDescription: "Category Description",
        categoryParent: "Parent Category",
        categoryStatus: "Status",
        
        // Units
        units: "Units",
        unit: "Unit",
        addUnit: "Add Unit",
        editUnit: "Edit Unit",
        deleteUnit: "Delete Unit",
        unitName: "Unit Name",
        unitSymbol: "Symbol",
        unitType: "Type",
        
        // Status
        active: "Active",
        inactive: "Inactive",
        
        // Stats
        total: "Total",
        active_count: "Active",
        inactive_count: "Inactive",
        
        // Messages
        deleteConfirmation: "Are you sure you want to delete this {{item}}?",
        deleteSuccess: "{{item}} deleted successfully",
        createSuccess: "{{item}} created successfully",
        updateSuccess: "{{item}} updated successfully",
        error: "An error occurred",
        
        // Empty states
        noProducts: "No products yet",
        noCategories: "No categories yet",
        noUnits: "No units yet",
        getStarted: "Get started by adding your first {{item}}",
        
        // View modes
        tableView: "Table View",
        cardsView: "Cards View"
      },
    },
    "pt-BR": {
      translation: {
        // App
        appName: "electron-shadcn",
        titleHomePage: "Página Inicial",
        titleSecondPage: "Segunda Página",
        
        // Common
        cancel: "Cancelar",
        save: "Salvar",
        edit: "Editar",
        delete: "Excluir",
        view: "Visualizar",
        add: "Adicionar",
        create: "Criar",
        update: "Atualizar",
        search: "Pesquisar",
        filter: "Filtrar",
        filters: "Filtros",
        loading: "Carregando...",
        refresh: "Atualizar",
        export: "Exportar",
        import: "Importar",
        close: "Fechar",
        submit: "Enviar",
        reset: "Resetar",
        confirm: "Confirmar",
        
        // Table
        columns: "Colunas",
        actions: "Ações",
        noDataFound: "Nenhum dado encontrado",
        showingResults: "Mostrando {{count}} de {{total}} resultados",
        perPage: "por página",
        previous: "Anterior",
        next: "Próximo",
        page: "Página",
        of: "de",
        
        // Forms
        required: "Obrigatório",
        optional: "Opcional",
        validation: {
          required: "{{field}} é obrigatório",
          email: "Por favor, digite um endereço de email válido",
          number: "Por favor, digite um número válido",
          min: "{{field}} deve ser pelo menos {{min}}",
          max: "{{field}} deve ser no máximo {{max}}",
          pattern: "Formato de {{field}} é inválido"
        },
        
        // Products
        products: "Produtos",
        product: "Produto",
        addProduct: "Adicionar Produto",
        editProduct: "Editar Produto",
        deleteProduct: "Excluir Produto",
        productName: "Nome do Produto",
        productSKU: "SKU",
        productPrice: "Preço",
        productStock: "Estoque",
        productCategory: "Categoria",
        productUnit: "Unidade",
        productDescription: "Descrição",
        productActive: "Ativo",
        productInactive: "Inativo",
        
        // Categories
        categories: "Categorias",
        category: "Categoria",
        addCategory: "Adicionar Categoria",
        editCategory: "Editar Categoria",
        deleteCategory: "Excluir Categoria",
        categoryName: "Nome da Categoria",
        categoryDescription: "Descrição da Categoria",
        categoryParent: "Categoria Pai",
        categoryStatus: "Status",
        
        // Units
        units: "Unidades",
        unit: "Unidade",
        addUnit: "Adicionar Unidade",
        editUnit: "Editar Unidade",
        deleteUnit: "Excluir Unidade",
        unitName: "Nome da Unidade",
        unitSymbol: "Símbolo",
        unitType: "Tipo",
        
        // Status
        active: "Ativo",
        inactive: "Inativo",
        
        // Stats
        total: "Total",
        active_count: "Ativo",
        inactive_count: "Inativo",
        
        // Messages
        deleteConfirmation: "Tem certeza que deseja excluir este {{item}}?",
        deleteSuccess: "{{item}} excluído com sucesso",
        createSuccess: "{{item}} criado com sucesso",
        updateSuccess: "{{item}} atualizado com sucesso",
        error: "Ocorreu um erro",
        
        // Empty states
        noProducts: "Nenhum produto ainda",
        noCategories: "Nenhuma categoria ainda",
        noUnits: "Nenhuma unidade ainda",
        getStarted: "Comece adicionando seu primeiro {{item}}",
        
        // View modes
        tableView: "Visualização em Tabela",
        cardsView: "Visualização em Cards"
      },
    },
  },
});
