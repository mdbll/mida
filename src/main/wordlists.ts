import { watch, type FSWatcher } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import type { WordlistEntry } from "../shared/commands";

const WORDLIST_DIR = resolve(process.cwd(), "wordlists");
const DEFAULT_WORDLIST = join(WORDLIST_DIR, "passwords.txt");

export async function ensureWordlistDirectory(): Promise<void> {
  await mkdir(WORDLIST_DIR, { recursive: true });

  try {
    await writeFile(DEFAULT_WORDLIST, "admin\npassword\n123456\n", {
      flag: "wx"
    });
  } catch {
    // File already exists.
  }
}

export async function listWordlists(): Promise<WordlistEntry[]> {
  await ensureWordlistDirectory();

  const entries = await readdir(WORDLIST_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      label: entry.name,
      value: join("wordlists", basename(entry.name))
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function watchWordlists(
  onChange: () => void | Promise<void>
): Promise<FSWatcher> {
  await ensureWordlistDirectory();

  let timeout: NodeJS.Timeout | undefined;

  return watch(WORDLIST_DIR, () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      void onChange();
    }, 150);
  });
}
