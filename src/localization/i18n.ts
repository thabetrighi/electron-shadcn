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
        print: "Print",
        clearFilters: "Clear Filters",
        showingXofY: "Showing {{start}}-{{end}} of {{total}}",
        
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
        units: {
          units: "Units",
          unit: "Unit",
          addUnit: "Add Unit",
          editUnit: "Edit Unit",
          deleteUnit: "Delete Unit",
          name: "Name",
          nameEn: "English Name",
          symbol: "Symbol",
          type: "Type",
          conversionRate: "Conversion Rate",
          baseUnit: "Base Unit",
          totalUnits: "Total Units",
          activeUnits: "Active Units",
          unitTypes: "Unit Types",
          baseUnits: "Base Units",
          description: "Manage measurement units for your products",
          reportTitle: "Units Report",
          searchPlaceholder: "Search units...",
          noUnits: "No units found",
          noUnitsDescription: "Start by adding your first unit of measurement",
          addFirstUnit: "Add First Unit",
          deleteConfirm: "Are you sure you want to delete this unit?",
          bulkDeleteConfirm: "Are you sure you want to delete {{count}} units?",
          bulkStatusUpdated: "{{count}} units updated successfully",
          namePlaceholder: "Enter unit name",
          nameEnPlaceholder: "Enter English name",
          symbolPlaceholder: "Enter symbol (e.g., kg, pcs)",
          conversionRateHelper: "Conversion rate to base unit",
          baseUnitHelper: "Select base unit for conversion",
          baseUnitSelf: "Base Unit",
          types: {
            weight: "Weight",
            volume: "Volume",
            piece: "Piece",
            length: "Length"
          }
        },
        
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
        cardsView: "Cards View",
        
        // Navigation
        navigation: {
          dashboard: "Dashboard",
          products: "Products",
          categories: "Categories",
          units: "Units",
          users: "Users",
          orders: "Orders",
          pos: "POS",
          reports: "Reports",
          settings: "Settings"
        },
        
        // Common grouped properties
        common: {
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          activate: "Activate",
          deactivate: "Deactivate",
          delete: "Delete",
          error: "An error occurred",
          success: "Operation completed successfully",
          loading: "Loading...",
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          view: "View",
          add: "Add",
          create: "Create",
          update: "Update",
          search: "Search",
          filter: "Filter",
          export: "Export",
          print: "Print",
          refresh: "Refresh",
          close: "Close",
          submit: "Submit",
          reset: "Reset",
          confirm: "Confirm"
        }
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
        print: "Imprimir",
        clearFilters: "Limpar Filtros",
        showingXofY: "Mostrando {{start}}-{{end}} de {{total}}",
        
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
        units: {
          units: "Unidades",
          unit: "Unidade",
          addUnit: "Adicionar Unidade",
          editUnit: "Editar Unidade",
          deleteUnit: "Excluir Unidade",
          name: "Nome",
          nameEn: "Nome em Inglês",
          symbol: "Símbolo",
          type: "Tipo",
          conversionRate: "Taxa de Conversão",
          baseUnit: "Unidade Base",
          totalUnits: "Total de Unidades",
          activeUnits: "Unidades Ativas",
          unitTypes: "Tipos de Unidade",
          baseUnits: "Unidades Base",
          description: "Gerencie unidades de medida para seus produtos",
          reportTitle: "Relatório de Unidades",
          searchPlaceholder: "Pesquisar unidades...",
          noUnits: "Nenhuma unidade encontrada",
          noUnitsDescription: "Comece adicionando sua primeira unidade de medida",
          addFirstUnit: "Adicionar Primeira Unidade",
          deleteConfirm: "Tem certeza que deseja excluir esta unidade?",
          bulkDeleteConfirm: "Tem certeza que deseja excluir {{count}} unidades?",
          bulkStatusUpdated: "{{count}} unidades atualizadas com sucesso",
          namePlaceholder: "Digite o nome da unidade",
          nameEnPlaceholder: "Digite o nome em inglês",
          symbolPlaceholder: "Digite o símbolo (ex: kg, pcs)",
          conversionRateHelper: "Taxa de conversão para unidade base",
          baseUnitHelper: "Selecione a unidade base para conversão",
          baseUnitSelf: "Unidade Base",
          types: {
            weight: "Peso",
            volume: "Volume",
            piece: "Peça",
            length: "Comprimento"
          }
        },
        
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
        cardsView: "Visualização em Cards",
        
        // Navigation
        navigation: {
          dashboard: "Painel",
          products: "Produtos",
          categories: "Categorias",
          units: "Unidades",
          users: "Usuários",
          orders: "Pedidos",
          pos: "PDV",
          reports: "Relatórios",
          settings: "Configurações"
        }
      },
    },
  },
});

export default i18n;
