import type { ActionConfig } from "./types";

export const ACTIONS: ActionConfig[] = [
  {
    id: "ipAddress",
    label: "Réseau",
    description: "Inspecter les interfaces locales et les adresses IP de la machine.",
    category: "system",
    helper: "Commande locale utile pour voir les interfaces, IPv4, IPv6 et l'état réseau."
  },
  {
    id: "nmapDiscovery",
    label: "Découverte",
    description: "Vérifier si une cible ou un sous-réseau répond sans lancer un scan de ports.",
    category: "scan",
    needsTarget: true,
    helper: "Exemple: 192.168.1.10 ou 192.168.1.0/24"
  },
  {
    id: "nmapQuick",
    label: "Scan rapide",
    description: "Scanner rapidement les ports fréquents pour identifier les services exposés.",
    category: "scan",
    needsTarget: true,
    helper: "Pratique pour un premier passage rapide sur une machine cible."
  },
  {
    id: "nmapServices",
    label: "Services ouverts",
    description: "Voir directement les ports ouverts et les services détectés sur une IP.",
    category: "scan",
    needsTarget: true,
    helper: "Idéal pour identifier les services exposés sans régler une plage manuellement."
  },
  {
    id: "nmapPorts",
    label: "Ports cibles",
    description: "Scanner une plage de ports précise avec détection de service.",
    category: "scan",
    needsTarget: true,
    needsPortRange: true,
    helper: "Choisis une plage prédéfinie ou saisis une plage personnalisée."
  },
  {
    id: "hydra",
    label: "Hydra",
    description: "Exécuter une attaque dictionnaire Hydra avec un utilisateur et une wordlist choisis.",
    category: "bruteforce",
    needsHost: true,
    needsTarget: true,
    needsUsername: true,
    needsWordlist: true,
    helper: "Renseigne l'utilisateur, le host/service, la wordlist et l'IP cible."
  },
  {
    id: "hashcat",
    label: "Hashcat",
    description: "Exécuter un cassage de hash avec un mode, un fichier de hash et une wordlist.",
    category: "bruteforce",
    needsHashFile: true,
    needsMode: true,
    needsWordlist: true,
    helper: "Renseigne le mode hashcat, choisis un fichier hash et une wordlist."
  }
];

export const PORT_RANGE_OPTIONS = [
  { label: "Top 1000", value: "1-1000" },
  { label: "Web", value: "80-443" },
  { label: "Admin", value: "20-25" },
  { label: "Services classiques", value: "21-3306" },
  { label: "Personnalisée", value: "custom" }
] as const;

export const HYDRA_HOST_OPTIONS = [
  { label: "SSH", value: "ssh" },
  { label: "FTP", value: "ftp" },
  { label: "HTTP GET", value: "http-get" },
  { label: "HTTP POST", value: "http-post-form" },
  { label: "HTTPS GET", value: "https-get" },
  { label: "HTTPS POST", value: "https-post-form" },
  { label: "RDP", value: "rdp" },
  { label: "SMB", value: "smb" },
  { label: "SMTP", value: "smtp" },
  { label: "SNMP", value: "snmp" },
  { label: "Telnet", value: "telnet" },
  { label: "VNC", value: "vnc" }
] as const;

export const HASHCAT_MODE_OPTIONS = [
  { label: "0 - MD5", value: "0" },
  { label: "100 - SHA1", value: "100" },
  { label: "400 - phpass", value: "400" },
  { label: "500 - md5crypt", value: "500" },
  { label: "900 - MD4", value: "900" },
  { label: "1000 - NTLM", value: "1000" },
  { label: "13400 - KeePass", value: "13400" },
  { label: "1400 - SHA256", value: "1400" },
  { label: "1700 - SHA512", value: "1700" },
  { label: "1800 - sha512crypt", value: "1800" },
  { label: "22000 - WPA-PBKDF2", value: "22000" }
] as const;
