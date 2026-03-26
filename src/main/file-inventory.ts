import { watch, type FSWatcher } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

type InventoryEntry = {
  label: string;
  value: string;
};

async function ensureDirectoryWithDefault(
  directory: string,
  defaultFile: string,
  content: string
): Promise<void> {
  await mkdir(directory, { recursive: true });

  try {
    await writeFile(defaultFile, content, { flag: "wx" });
  } catch {
    // File already exists.
  }
}

async function listFiles(directory: string, prefix: string): Promise<InventoryEntry[]> {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      label: entry.name,
      value: join(prefix, basename(entry.name))
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

async function watchDirectory(
  directory: string,
  onChange: () => void | Promise<void>
): Promise<FSWatcher> {
  let timeout: NodeJS.Timeout | undefined;

  return watch(directory, () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      void onChange();
    }, 150);
  });
}

const WORDLIST_DIR = resolve(process.cwd(), "wordlists");
const DEFAULT_WORDLIST = join(WORDLIST_DIR, "passwords.txt");
const HASH_DIR = resolve(process.cwd(), "hashes");
const DEFAULT_HASH_FILE = join(HASH_DIR, "hashes.txt");

export async function ensureWordlistDirectory(): Promise<void> {
  await ensureDirectoryWithDefault(
    WORDLIST_DIR,
    DEFAULT_WORDLIST,
    "admin\npassword\n123456\n"
  );
}

export async function listWordlists(): Promise<InventoryEntry[]> {
  await ensureWordlistDirectory();
  return await listFiles(WORDLIST_DIR, "wordlists");
}

export async function watchWordlists(
  onChange: () => void | Promise<void>
): Promise<FSWatcher> {
  await ensureWordlistDirectory();
  return await watchDirectory(WORDLIST_DIR, onChange);
}

export async function ensureHashDirectory(): Promise<void> {
  await ensureDirectoryWithDefault(
    HASH_DIR,
    DEFAULT_HASH_FILE,
    "5f4dcc3b5aa765d61d8327deb882cf99\n"
  );
}

export async function listHashFiles(): Promise<InventoryEntry[]> {
  await ensureHashDirectory();
  return await listFiles(HASH_DIR, "hashes");
}

export async function watchHashFiles(
  onChange: () => void | Promise<void>
): Promise<FSWatcher> {
  await ensureHashDirectory();
  return await watchDirectory(HASH_DIR, onChange);
}
