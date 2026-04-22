import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// 1. Création du serveur
const server = new McpServer({
  name: "mcp-api",
  version: "1.0.0"
});

// 2. Outil pour récupérer le taux de change
server.tool(
  "taux_change",
  "Récupère le taux de change entre deux devises en temps réel",
  {
    devise_base: z.string().describe("La devise de base ex: USD"),
    devise_cible: z.string().describe("La devise cible ex: EUR, GBP, JPY")
  },
  async ({ devise_base, devise_cible }) => {
    const url = `https://api.frankfurter.app/latest?from=${devise_base}&to=${devise_cible}`;
    const reponse = await fetch(url);
    const data = await reponse.json();

    if (!data.rates || !data.rates[devise_cible]) {
      return { content: [{ type: "text", text: `Devise "${devise_cible}" non supportée ! Essaie EUR, GBP, JPY, CHF` }] };
    }

    const taux = data.rates[devise_cible];
    const texte = `1 ${devise_base} = ${taux} ${devise_cible}`;
    return { content: [{ type: "text", text: texte }] };
  }
);
// 4. Démarrage du serveur
const transport = new StdioServerTransport();
await server.connect(transport);