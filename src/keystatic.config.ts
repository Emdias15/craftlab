import { config, collection, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },

  ui: {
    brand: {
      name: "CraftLab.ed",
    },
  },

  collections: {
    produtos: collection({
      label: "Produtos",
      slugField: "nome",
      path: "content/produtos/*",
      format: { data: "json" },
      entryLayout: "content",
      schema: {
        nome: fields.slug({
          name: { label: "Nome do produto", validation: { isRequired: true } },
        }),
        descricao: fields.text({
          label: "Descrição curta",
          validation: { isRequired: true },
        }),
        descricaoLonga: fields.text({
          label: "Descrição detalhada",
          multiline: true,
        }),
        preco: fields.number({
          label: "Preço (€)",
          validation: { isRequired: true, min: 0 },
        }),
        categoria: fields.select({
          label: "Categoria",
          options: [
            { label: "Anilhas", value: "anilhas" },
            { label: "Porta-chaves", value: "porta-chaves" },
            { label: "Combos & Packs", value: "combos" },
          ],
          defaultValue: "anilhas",
        }),
        tag: fields.select({
          label: "Etiqueta",
          options: [
            { label: "Nenhuma", value: "" },
            { label: "Best Seller", value: "Best seller" },
            { label: "Novo", value: "Novo" },
            { label: "Oferta", value: "Oferta" },
          ],
          defaultValue: "",
        }),
        stock: fields.integer({
          label: "Stock disponível",
          defaultValue: 10,
          validation: { isRequired: true, min: 0 },
          description: "Coloca 0 para marcar como Esgotado",
        }),
        destaque: fields.checkbox({
          label: "Em destaque na homepage",
          defaultValue: false,
        }),
        disponivel: fields.checkbox({
          label: "Disponível para venda",
          defaultValue: true,
        }),
        fotos: fields.array(
          fields.image({
            label: "Fotografia",
            directory: "public/produtos",
            publicPath: "/produtos/",
          }),
          {
            label: "Fotografias",
            itemLabel: () => "Foto",
            validation: { length: { min: 1 } },
          }
        ),
      },
    }),
  },
});
