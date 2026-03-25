import type { ActionConfig } from "./types";

export const ACTIONS: ActionConfig[] = [
  {
    id: "ipAddress",
    label: "Reseau",
    description: "Inspecter les interfaces locales et les adresses IP de la machine.",
    category: "system",
    helper: "Commande locale utile pour voir les interfaces, IPv4, IPv6 et l'etat reseau."
  },
  {
    id: "nmapDiscovery",
    label: "Decouverte",
    description: "Verifier si une cible ou un sous-reseau repond sans lancer un scan de ports.",
    category: "scan",
    needsTarget: true,
    helper: "Exemple: 192.168.1.10 ou 192.168.1.0/24"
  },
  {
    id: "nmapQuick",
    label: "Scan rapide",
    description: "Scanner rapidement les ports frequents pour identifier les services exposes.",
    category: "scan",
    needsTarget: true,
    helper: "Pratique pour un premier passage rapide sur une machine cible."
  },
  {
    id: "nmapServices",
    label: "Services ouverts",
    description: "Voir directement les ports ouverts et les services detectes sur une IP.",
    category: "scan",
    needsTarget: true,
    helper: "Ideal pour identifier les services exposes sans regler une plage manuellement."
  },
  {
    id: "nmapPorts",
    label: "Ports cibles",
    description: "Scanner une plage de ports precise avec detection de service.",
    category: "scan",
    needsTarget: true,
    needsPortRange: true,
    helper: "Choisis une plage predefinie ou saisis une plage personnalisee."
  }
];

export const PORT_RANGE_OPTIONS = [
  { label: "Top 1000", value: "1-1000" },
  { label: "Web", value: "80-443" },
  { label: "Admin", value: "20-25" },
  { label: "Services classiques", value: "21-3306" },
  { label: "Personnalisee", value: "custom" }
] as const;
